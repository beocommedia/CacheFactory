import {
  assert,
  Cache
} from '../../_setup'

describe('Cache#removeExpired', function () {
  it('should remove all expired items when deleteOnExpire is "none"', function (done) {
    const cache = new Cache(this.testId, {
      deleteOnExpire: 'none',
      maxAge: 10,
      recycleFreq: 20
    })
    const value1 = 'value1'
    const value2 = 2
    const value3 = {
      value3: 'stuff'
    }
    cache.put('item1', value1)
    cache.put('item2', value2)
    cache.put('item3', value3)

    setTimeout(function () {
      const expired = cache.removeExpired()
      assert.deepEqual(expired, {
        item1: value1,
        item2: value2,
        item3: value3
      })
      assert.strictEqual(cache.info().size, 0)
      cache.put('item3', value3)
      assert.strictEqual(cache.info().size, 1)

      done()
    }, 1000)
  })

  it('should return expired items with non-null values when the storageMode is "localStorage"', function (done) {
    const cache = new Cache(this.testId, {
      deleteOnExpire: 'none',
      storageMode: 'localStorage',
      maxAge: 10,
      recycleFreq: 20
    })

    const item1 = {
      key: 'item1',
      expires: 1
    }
    const item1Value = 'value1'

    const item2 = {
      key: 'item2',
      expires: 2
    }
    const item2Value = 2

    const item3 = {
      key: 'item3',
      expires: 3
    }
    const item3Value = {
      value3: 'stuff'
    }

    sinon.stub(cache.$$expiresHeap, 'peek')
      .onFirstCall().returns(item1)
      .onSecondCall().returns(item2)
      .onThirdCall().returns(item3)

    sinon.stub(cache.$$expiresHeap, 'pop')

    sinon.stub(cache, 'remove')
      .onFirstCall().returns(item1Value)
      .onSecondCall().returns(item2Value)
      .onThirdCall().returns(item3Value)

    cache.$$onExpire = false

    const expired = cache.removeExpired()
    assert.deepEqual(expired, {
      item1: item1Value,
      item2: item2Value,
      item3: item3Value
    })
    done()
  })
})
