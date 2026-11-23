// Downloads the embedding model so it is stored inside the Docker image (run during the image build).
import { embedTexts } from "../src/semantic/embedder.js";
import { SEMANTIC } from "../src/semantic/semanticConfig.js";

console.log(`downloading ${SEMANTIC.model} ...`);
const [vector] = await embedTexts(["warm up"]);
console.log(`done (${vector.length} dimensions)`);