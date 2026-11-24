import assert from 'node:assert/strict';
import { test } from 'node:test';
import { detectMimeFromBuffer } from '../src/utils/fileValidation';

test('recognizes a PDF by its file signature', () => {
  assert.equal(detectMimeFromBuffer(Buffer.from('%PDF-1.7')), 'application/pdf');
});

test('recognizes the ZIP signature used by DOCX uploads', () => {
  const header = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
  assert.equal(
    detectMimeFromBuffer(header),
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  );
});

test('rejects truncated signatures and unsupported content', () => {
  for (const input of ['', '%PD', '%PDX', 'plain text']) {
    assert.equal(detectMimeFromBuffer(Buffer.from(input)), null, input);
  }
});
