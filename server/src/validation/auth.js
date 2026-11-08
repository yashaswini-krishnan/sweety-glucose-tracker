const { z } = require('zod');
const { httpError } = require('../utils/httpError');

const registerSchema = z.object({
  name: z.string({ error: 'Please enter your name.' }).trim().min(1, { error: 'Please enter your name.' }),
  email: z
    .string({ error: 'Please enter a valid email.' })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: 'Please enter a valid email.' })),
  password: z
    .string({ error: 'Password must be at least 8 characters.' })
    .min(8, { error: 'Password must be at least 8 characters.' }),
});

// Login only checks that both fields were sent in a usable shape.
// A wrong email or password is handled later as 401, not as a validation error.
const loginSchema = z.object({
  email: z
    .string({ error: 'Please enter a valid email.' })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: 'Please enter a valid email.' })),
  password: z.string({ error: 'Please enter your password.' }).min(1, { error: 'Please enter your password.' }),
});

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    // One message at a time, in field order: name, email, then password.
    throw httpError(400, result.error.issues[0].message);
  }
  return result.data;
}

function parseRegister(body) {
  return parse(registerSchema, body);
}

function parseLogin(body) {
  return parse(loginSchema, body);
}

module.exports = { parseRegister, parseLogin };
