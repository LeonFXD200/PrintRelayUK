import { describe, it, expect } from 'vitest'
import {
  validateQuote,
  isValidEmail,
  isValidPhone,
  isAcceptedFile,
} from './validateQuote.js'

// A complete, valid set of form values to tweak per test.
const base = {
  name: 'Jane Maker',
  email: 'jane@example.com',
  phone: '07700 900123',
  what_printed: 'A small mounting bracket',
  quantity: '2',
  material: 'pla',
  consent: true,
}

describe('isValidEmail', () => {
  it('accepts a normal address', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('first.last@example.co.uk')).toBe(true)
  })
  it('rejects malformed addresses', () => {
    expect(isValidEmail('nope')).toBe(false)
    expect(isValidEmail('a@b')).toBe(false)
    expect(isValidEmail('a b@c.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('accepts UK and international formats', () => {
    expect(isValidPhone('07700 900123')).toBe(true)
    expect(isValidPhone('+44 1732 456789')).toBe(true)
    expect(isValidPhone('(0161) 496 0123')).toBe(true)
  })
  it('rejects too short or non-numeric', () => {
    expect(isValidPhone('123')).toBe(false)
    expect(isValidPhone('call me')).toBe(false)
    expect(isValidPhone('')).toBe(false)
  })
})

describe('isAcceptedFile', () => {
  it('accepts supported 3D formats (case-insensitive)', () => {
    expect(isAcceptedFile('part.stl')).toBe(true)
    expect(isAcceptedFile('MODEL.OBJ')).toBe(true)
    expect(isAcceptedFile('bundle.zip')).toBe(true)
  })
  it('rejects unsupported types', () => {
    expect(isAcceptedFile('virus.exe')).toBe(false)
    expect(isAcceptedFile('photo.png')).toBe(false)
    expect(isAcceptedFile('noextension')).toBe(false)
  })
})

describe('validateQuote', () => {
  it('passes a complete form', () => {
    const { valid, errors } = validateQuote(base)
    expect(valid).toBe(true)
    expect(errors).toEqual({})
  })

  it('flags every required field when empty', () => {
    const { valid, errors } = validateQuote({})
    expect(valid).toBe(false)
    for (const key of [
      'name',
      'email',
      'phone',
      'what_printed',
      'quantity',
      'material',
      'consent',
    ]) {
      expect(errors[key]).toBeTruthy()
    }
  })

  it('rejects a bad email and phone', () => {
    const { errors } = validateQuote({ ...base, email: 'bad', phone: '12' })
    expect(errors.email).toBeTruthy()
    expect(errors.phone).toBeTruthy()
  })

  it('rejects quantity below 1', () => {
    expect(validateQuote({ ...base, quantity: '0' }).errors.quantity).toBeTruthy()
    expect(validateQuote({ ...base, quantity: '-3' }).errors.quantity).toBeTruthy()
  })

  it('requires the consent checkbox', () => {
    expect(validateQuote({ ...base, consent: false }).errors.consent).toBeTruthy()
  })

  it('rejects an unsupported / oversized file', () => {
    expect(validateQuote({ ...base, file: { name: 'x.exe', size: 10 } }).errors.file).toBeTruthy()
    const huge = { name: 'big.stl', size: 999 * 1024 * 1024 }
    expect(validateQuote({ ...base, file: huge }).errors.file).toBeTruthy()
  })

  it('accepts a valid file', () => {
    const file = { name: 'good.stl', size: 1024 }
    expect(validateQuote({ ...base, file }).valid).toBe(true)
  })

  it('enforces Turnstile only when required', () => {
    // Not required by default -> passes without a token.
    expect(validateQuote(base).valid).toBe(true)
    // Required + no token -> error.
    expect(validateQuote(base, { turnstileRequired: true }).errors.turnstile).toBeTruthy()
    // Required + token -> passes.
    expect(
      validateQuote({ ...base, turnstileToken: 'tok' }, { turnstileRequired: true }).valid,
    ).toBe(true)
  })
})
