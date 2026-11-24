"""Semantic similarity with all-MiniLM-L6-v2, falling back to TF-IDF.

The MiniLM model is loaded lazily. If sentence-transformers is not installed
or the model cannot be downloaded, a TF-IDF (word + character n-gram) cosine
is used instead and the backend name is reported in every match result.
"""

from __future__ import annotations

import logging
import threading
from functools import lru_cache

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import get_settings

log = logging.getLogger(__name__)


class TfidfEncoder:
    name = "tfidf-fallback"
    # cosine values from TF-IDF on short role texts are lower than MiniLM's
    floor, ceiling = 0.03, 0.55

    def similarity(self, a: str, b: str) -> float:
        if not a.strip() or not b.strip():
            return 0.0
        word = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", sublinear_tf=True)
        char = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), sublinear_tf=True)
        try:
            w = cosine_similarity(word.fit_transform([a, b]))[0, 1]
        except ValueError:  # only stop words
            w = 0.0
        c = cosine_similarity(char.fit_transform([a, b]))[0, 1]
        return float(0.6 * w + 0.4 * c)


class MiniLMEncoder:
    name = "all-MiniLM-L6-v2"
    floor, ceiling = 0.15, 0.75

    def __init__(self, model_name: str):
        from sentence_transformers import SentenceTransformer  # heavy import, keep lazy

        self.model = SentenceTransformer(model_name, device="cpu")

    @lru_cache(maxsize=2048)
    def _embed(self, text: str) -> np.ndarray:
        return self.model.encode([text], normalize_embeddings=True)[0]

    def similarity(self, a: str, b: str) -> float:
        if not a.strip() or not b.strip():
            return 0.0
        return float(np.dot(self._embed(a[:2000]), self._embed(b[:2000])))


_lock = threading.Lock()
_encoder: TfidfEncoder | MiniLMEncoder | None = None


def get_encoder() -> TfidfEncoder | MiniLMEncoder:
    global _encoder
    if _encoder is not None:
        return _encoder
    with _lock:
        if _encoder is None:
            settings = get_settings()
            if settings.embeddings_enabled:
                try:
                    _encoder = MiniLMEncoder(settings.embedding_model)
                    log.info("Loaded embedding model %s", settings.embedding_model)
                except Exception as exc:  # ImportError, network, disk
                    log.warning("MiniLM unavailable (%s); using TF-IDF fallback", exc.__class__.__name__)
                    _encoder = TfidfEncoder()
            else:
                _encoder = TfidfEncoder()
    return _encoder


def current_backend() -> str:
    """Name of the loaded encoder, or 'loading' while MiniLM is still warming up."""
    return _encoder.name if _encoder is not None else "loading"


def warm_up() -> None:
    threading.Thread(target=get_encoder, name="encoder-warmup", daemon=True).start()


def calibrated(similarity: float, encoder: TfidfEncoder | MiniLMEncoder) -> float:
    """Map raw cosine similarity onto 0-100 using the encoder's typical range."""
    span = encoder.ceiling - encoder.floor
    return float(np.clip((similarity - encoder.floor) / span, 0.0, 1.0) * 100)
