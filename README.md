# gogoto

Go-style `[error, data]` tuples for your requests and promises. No more `try/catch` blocks.

```js
import { go } from 'gogoto'

const [err, user] = await go('https://api.example.com/users/1', { method: 'get' })

if (err) return console.log(err.message)

console.log(user.name)
```

## Install

```sh
npm install gogoto
```

`gogoto` is an ES module with zero dependencies. It uses the global `fetch`, so it runs in browsers and in Node.js 18+.

## Usage

### `go(url, configs)`

Makes a JSON request with `fetch` and resolves to `[error, data]`. It never rejects.

```js
import { go } from 'gogoto'

const [err, post] = await go('https://api.example.com/posts', {
  method: 'post',
  headers: { Authorization: `Bearer ${token}` },
  body: { title: 'Hello', content: 'World' },
})

if (err) {
  // handle the error
  return
}

console.log(post.id)
```

| Config    | Type     | Required | Description                                              |
| --------- | -------- | -------- | -------------------------------------------------------- |
| `method`  | `string` | yes      | HTTP method, in any case (`'get'`, `'POST'`...)          |
| `headers` | `object` | no       | Extra headers, merged over the defaults                  |
| `body`    | `object` | no       | Request payload, serialized with `JSON.stringify`        |

`Accept: application/json` is always sent, and `Content-Type: application/json` is sent along with a `body`. Both can be overridden through `headers`.

The result is one of:

| Case                                          | `error`                                | `data`           |
| --------------------------------------------- | -------------------------------------- | ---------------- |
| 2xx response                                  | `null`                                 | parsed JSON body |
| 2xx response with an empty body (e.g. `204`)  | `null`                                 | `null`           |
| Non-2xx response                              | parsed JSON body of the error response | `null`           |
| Non-2xx response with an empty body           | `{ message }` with the status          | `null`           |
| Network failure or a response that isn't JSON | `{ message }`                          | `null`           |

Since `data` can be `null` on success, always check `error` to know whether the request failed. In the last two cases the original error is also logged with `console.error`.

### `goto(promise)`

Wraps any promise and resolves to `[error, result]`.

```js
import { goto } from 'gogoto'
import { readFile } from 'node:fs/promises'

const [err, content] = await goto(readFile('./config.json', 'utf8'))

if (err) {
  console.log(err.code) // 'ENOENT'
  return
}

console.log(content)
```

If the promise rejects, `error` is the rejection reason, untouched. Otherwise it is `null` and `result` is the resolved value.

## TypeScript

Type declarations are included. Pass the expected response type to `go`, and optionally the error type:

```ts
import { go, goto } from 'gogoto'

interface User {
  name: string
}

const [err, user] = await go<User>('https://api.example.com/users/1', { method: 'get' })

if (err) return console.log(err.message)

console.log(user.name) // `user` is narrowed to `User` here
```

```ts
interface ApiError {
  code: string
  message: string
}

const [err, user] = await go<User, ApiError>(url, { method: 'get' })
```

`goto` infers the result type from the promise. The error type defaults to `Error` and can be changed with the second type argument:

```ts
const [err, content] = await goto(readFile('./config.json', 'utf8')) // content: string

const [err, content] = await goto<string, NodeJS.ErrnoException>(readFile('./config.json', 'utf8'))
```

For endpoints that answer with an empty body, use `go<null>`.

## License

[MIT](LICENSE)
