export interface Result<T, E> {
  get isOk(): boolean
  get isErr(): boolean
  map<U>(op: (value: T) => U): Result<U, E>
  mapErr<O>(op: (err: E) => O): Result<T, O>
  mapOr<U>(_default: U, op: (value: T) => U): Result<U, E>
  mapOrElse<U>(_default: (err: E) => U, op: (value: T) => U): Result<U, E>
  inspect(f: (value: T) => any): Result<T, E>
  inspectErr(f: (err: E) => any): Result<T, E>
  expect(msg: string): T
  unwrap(): T
  unwrapOrDefault(_default: T): T
  unwrapOrElse(_default: (err: E) => T): T
  expectErr(msg: string): E
  unwrapErr(): E
}

export class Ok<T, E> implements Result<T, E> {
  constructor(private value: T) {}

  get isOk(): boolean {
    return true
  }

  get isErr(): boolean {
    return false
  }

  unwrap(): T {
    return this.value
  }

  map<U>(op: (value: T) => U): Result<U, E> {
    return new Ok(op(this.value))
  }

  mapErr<O>(op: (err: E) => O): Result<T, O> {
    return new Ok(this.value)
  }

  mapOr<U>(_default: U, op: (value: T) => U): Result<U, E> {
    return new Ok(op(this.value))
  }

  mapOrElse<U>(_default: (err: E) => U, op: (value: T) => U): Result<U, E> {
    return new Ok(op(this.value))
  }

  inspect(f: (value: T) => any): Result<T, E> {
    f(this.value)
    return this
  }

  inspectErr(_f: (err: E) => any): Result<T, E> {
    return this
  }

  expect(_msg: string): T {
    return this.value
  }

  unwrapOrDefault(_default: T): T {
    return this.value
  }

  unwrapOrElse(_default: (err: E) => T): T {
    return this.value
  }

  expectErr(msg: string): E {
    console.log(msg)
    this.notErrPanic()
  }

  unwrapErr(): E {
    this.notErrPanic()
  }

  private notErrPanic(): never {
    throw new Error('expect err but it was ok')
  }
}

export class Err<T, E> implements Result<T, E> {
  constructor(private err: E) {}

  get isOk(): boolean {
    return false
  }

  get isErr(): boolean {
    return true
  }

  unwrap(): T {
    this.panic()
  }

  map<U>(_op: (value: T) => U): Result<U, E> {
    return err(this.err)
  }

  mapErr<O>(op: (err: E) => O): Result<T, O> {
    return err(op(this.err))
  }

  mapOr<U>(_default: U, op: (value: T) => U): Result<U, E> {
    return ok(_default)
  }

  mapOrElse<U>(_default: (err: E) => U, op: (value: T) => U): Result<U, E> {
    return ok(_default(this.err))
  }

  inspect(_f: (value: T) => any): Result<T, E> {
    return this
  }

  inspectErr(f: (err: E) => any): Result<T, E> {
    f(this.err)
    return this
  }

  expect(msg: string): T {
    console.log(msg)
    this.panic()
  }

  unwrapOrDefault(_default: T): T {
    return _default
  }

  unwrapOrElse(_default: (err: E) => T): T {
    return _default(this.err)
  }

  expectErr(_msg: string): E {
    return this.err
  }

  unwrapErr(): E {
    return this.err
  }

  private panic(): never {
    if (this.err instanceof Error || typeof this.err === 'string') {
      throw this.err
    }
    throw new Error(`UndefinedError: ${typeof this.err}`)
  }
}

export const ok = <T, E>(value: T): Result<T, E> => new Ok(value)
export const err = <T, E>(err: E): Result<T, E> => new Err(err)
