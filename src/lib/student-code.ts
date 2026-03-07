// Exclude look-alike characters: 0, O, 1, I, L
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export function generateStudentCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/**
 * Generates a unique code not already in the provided set of active codes.
 */
export function generateUniqueStudentCode(activeCodes: Set<string>): string {
  let code: string;
  let attempts = 0;
  do {
    code = generateStudentCode();
    attempts++;
    if (attempts > 1000) throw new Error('Could not generate unique student code');
  } while (activeCodes.has(code));
  return code;
}
