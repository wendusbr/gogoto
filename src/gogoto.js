/**
 * @typedef { Object } Configs
 * @property { string } method
 * @property { object | null } headers
 * @property { object | null } body
 *
 * @param { string } url
 * @param { Configs } configs
 * @returns { Promise<[Object | null, Object | null]> }
 * - 0: error | null
 * - 1: response | null
 */
async function go(url, configs) {
  try {
    const res = await fetch(url, {
      method: configs.method.toUpperCase(),
      headers: {
        Accept: 'application/json',
        ...(configs.body ? { 'Content-Type': 'application/json' } : {}),
        ...(configs.headers ?? {}),
      },
      body: configs.body ? JSON.stringify(configs.body) : undefined,
    })

    const resText = await res.text()
    const resJson = resText ? JSON.parse(resText) : null

    if (!res.ok) {
      const err = new Error(`${res.status} ${res.statusText}`)
      err.data = resJson

      throw err
    }

    return [null, resJson]
  } catch (err) {
    return [err.data ?? (console.error(err), { message: err.message }), null]
  }
}

/**
 *
 * @param {Promise} promise
 * @returns { Promise<[Object | null, Object | null]> }
 * - 0: error | null
 * - 1: response | null
 */
const goto = (promise) =>
  promise.then((res) => [null, res]).catch((err) => [err, null])

export { go, goto }
