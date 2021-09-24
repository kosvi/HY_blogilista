const listHelper = require('../utils/list_helper')

const singleBlogWithZeroLikes = [{
  _id: '6148c62e810120307e2ffa26',
  title: 'Foo',
  author: 'Foo Bar',
  url: 'http://fooblog.example.com',
  likes: 0,
  __v: 0
}]
const singleBlogWith5Likes = [{
  _id: '6148c62e810120307e2ffa26',
  title: 'Foo',
  author: 'Foo Bar',
  url: 'http://fooblog.example.com',
  likes: 5,
  __v: 0
}]
const multipleBlogsWithVariableLikes = [{
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

const singleBlogByVille = [{
  _id: '6148cc417631421f596388d7',
  title: 'abc',
  author: 'Ville Koskela',
  url: 'http://blog.codecache.eu',
  likes: 10000,
  __v: 0
}]

const mutipleBlogsWithDifferentAuthors = [{
  _id: '6148cc417631421f596388d7',
  title: 'abc',
  author: 'Ville Koskela',
  url: 'http://blog.codecache.eu',
  likes: 10000,
  __v: 0
},
{
  _id: '6148cc417631421f596388d7',
  title: 'Imagine a nice name',
  author: 'Pekka Päkä',
  url: 'http://paka.example.com',
  likes: 101,
  __v: 0
},
{
  _id: '6148cc417631421f596388d7',
  title: 'HomePage',
  author: 'Ville Koskela',
  url: 'http://blog.kv1.fi',
  likes: 10001,
  __v: 0
}]

test('dummy returns one', () => {
  expect(listHelper.dummy([])).toBe(1)
})

describe('total likes', () => {
  // test case 1
  test('empty list with zero likes', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })

  // test case 2 - let's add single blog
  test('single blog without likes, expect zero', () => {
    expect(listHelper.totalLikes(singleBlogWithZeroLikes)).toBe(0)
  })
  // test case 3 - single blog with likes
  test('single blog with 5 likes, expect 5', () => {
    expect(listHelper.totalLikes(singleBlogWith5Likes)).toBe(5)
  })
  // test case 4 - add more blogs
  test('multiple blogs with total of 15 likes', () => {
    expect(listHelper.totalLikes(multipleBlogsWithVariableLikes)).toBe(15)
  })
})

describe('favorite blog', () => {
  test('empty array, expect object with negative likes', () => {
    expect(listHelper.favoriteBlog([])).toEqual({ likes: -1 })
  })
  test('single blog with zero likes', () => {
    expect(listHelper.favoriteBlog(singleBlogWithZeroLikes)).toEqual(singleBlogWithZeroLikes[0])
  })
  test('single blog with 5 likes', () => {
    expect(listHelper.favoriteBlog(singleBlogWith5Likes)).toEqual(singleBlogWith5Likes[0])
  })
  test('multiple blogs, index 2 with 10 likes', () => {
    expect(listHelper.favoriteBlog(multipleBlogsWithVariableLikes)).toEqual(multipleBlogsWithVariableLikes[2])
  })
})

describe('most blogs', () => {
  test('empty array, expect number of blogs to be negative', () => {
    expect(listHelper.mostBlogs([])).toEqual({ author: '', blogs: -1 })
  })
  test('single blog in the array', () => {
    expect(listHelper.mostBlogs(singleBlogByVille)).toEqual({ author: 'Ville Koskela', blogs: 1 })
  })
  test('multiple blogs by Ville', () => {
    expect(listHelper.mostBlogs(mutipleBlogsWithDifferentAuthors)).toEqual({ author: 'Ville Koskela', blogs: 2 })
  })
})

describe('most likes', () => {
  test('empty array, expect number of likes to be negative', () => {
    expect(listHelper.mostLikes([])).toEqual({ author: '', likes: -1 })
  })
  test('multiple blogs by Ville with ton of likes', () => {
    expect(listHelper.mostLikes(mutipleBlogsWithDifferentAuthors)).toEqual({ author: 'Ville Koskela', likes: 20001 })
  })
})