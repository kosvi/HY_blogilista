const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  expect(listHelper.dummy(blogs)).toBe(1)
})

describe('total likes', () => {
  // test case 1
  test('empty list with zero likes', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })

  // test case 2 - let's add single blog
  const blogs = [{
    _id: '6148c62e810120307e2ffa26',
    title: 'Foo',
    author: 'Foo Bar',
    url: 'http://fooblog.example.com',
    likes: 0,
    __v: 0
  }]
  test('single blog without likes, expect zero', () => {
    expect(listHelper.totalLikes(blogs)).toBe(0)
  })
  // test case 3 - single blog with likes
  const blogs2 = [{
    _id: '6148c62e810120307e2ffa26',
    title: 'Foo',
    author: 'Foo Bar',
    url: 'http://fooblog.example.com',
    likes: 5,
    __v: 0
  }]
  test('single blog with 5 likes, expect 5', () => {
    expect(listHelper.totalLikes(blogs2)).toBe(5)
  })
  // test case 4 - add more blogs
  const blogs3 = [{
    _id: '6148c62e810120307e2ffa26',
    title: 'Foo',
    author: 'Foo Bar',
    url: 'http://fooblog.example.com',
    likes: 5,
    __v: 0
  },
  {
    _id: '6148cba69837330446adc644',
    title: 'Testi',
    author: 'Testi Nimi',
    url: 'http://testblog.example.com',
    likes: 0,
    __v: 0
  },
  {
    _id: '6148cc417631421f596388d7',
    title: 'abc',
    author: 'Ville Koskela',
    url: 'http://codecache.eu',
    likes: 10,
    __v: 0
  }]
  test('multiple blogs with total of 15 likes', () => {
    expect(listHelper.totalLikes(blogs3)).toBe(15)
  })
})