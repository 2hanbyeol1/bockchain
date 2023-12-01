import { Result, err, ok } from './result'

export interface Option<T> {
  unwrap(): T
  map<U>(op: (t: T) => U): Option<U>
  someResult<RT, RE>(obj: {
    Ok: (value: T) => RT
    Err: () => RE
  }): Result<RT, RE>
}

export class Some<T> implements Option<T> {
  constructor(public value: T) {}

  unwrap(): T {
    return this.value
  }

  map<U>(op: (t: T) => U): Option<U> {
    return new Some(op(this.value))
  }

  someResult<RT, RE>({
    Ok,
  }: {
    Ok: (value: T) => RT
    Err: () => RE
  }): Result<RT, RE> {
    return ok(Ok(this.value))
  }
}

export class None<T> implements Option<T> {
  unwrap(): T {
    this.panic('unwrap')
  }

  map<U>(op: (t: T) => U): Option<U> {
    return new None()
  }

  someResult<RT, RE>({
    Err,
  }: {
    Ok: (value: T) => RT
    Err: () => RE
  }): Result<RT, RE> {
    return err(Err())
  }

  private panic(message: String): never {
    throw message
  }
}

export const nullable = <T>(value: T | undefined | null): Option<T> => {
  if (value) {
    return new Some(value)
  } else {
    return new None()
  }
}
