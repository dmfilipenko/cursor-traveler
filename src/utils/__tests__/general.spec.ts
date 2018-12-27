
import { argsToList } from '../general';

describe('converterMetrics', () => {
  it('list function ', () => {
    expect(argsToList(100, 'asd')).toEqual([100, 'asd'])
  })
})