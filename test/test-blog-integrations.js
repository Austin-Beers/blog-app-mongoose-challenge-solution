const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');

const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);


function seedBlogData(){
    console.info('seeding blog data');
    const seedData =[];

    for (let i=1; i<=10; i++) {
        seedData.push(generateBlogData());
      }
      
      return Blog.insertMany(seedData);

}

function generateTitle(){
    const titles = [
        'Bean', 'Bag', 'Snake flights', 'Bean flights'];
        return titles[Math.floor(Math.random() * boroughs.length)];    
}

function generateAuthor(){
 return {
     firtName: faker.name.firstName,
     lastName: faker.name.lastName
 }
}

function generateBlogData(){
    return {
        title: generateTitle(),
        content: faker.Lorem.sentence,
        author: generateAuthor(),
        created: faker.date.past()
    }
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
  }



  describe('Blog Posts API resource', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
      });

    beforeEach(function() {
        return seedRestaurantData();
      });

    afterEach(function() {
        return tearDownDb();
      });

    after(function() {
        return closeServer();
      });


    describe('GET endpoint', function() {

        it('should return all existing posts', function() {

          let res;
          return chai.request(app)
            .get('/posts')
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(200);
              expect(res.body.posts).to.have.length.of.at.least(1);
              return BlogPost.count();
            })
            .then(function(count) {
              expect(res.body.blogposts).to.have.length.of(count);
            });
        });

        it('should return posts with right fields', function() {
            let resPost;
            return chai.request(app)
              .get('/posts')
              .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.posts).to.be.a('array');
                expect(res.body.posts).to.have.length.of.at.least(1);
      
                res.body.posts.forEach(function(post) {
                  expect(post).to.be.a('object');
                  expect(post).to.include.keys(
                    'id', 'title', 'content', 'author', 'created');
                });
          
                resPost = res.body.posts[0];
          return BlogPost.findById(resPost.id);
        })
        .then(function(post) {

          expect(resPost.id).to.equal(post.id);
          expect(resPost.title).to.equal(post.title);
          expect(resPost.content).to.equal(post.content);
          expect(resPost.author).to.equal(post.author);
          expect(resPost.created).to.equal(post.created);
        });
    });
  });
         
  describe('POST endpoint', function() {

    it('should add a new post', function() {

    const newPost = generateBlogData();


    return chai.request(app)
    .post('/posts')
    .send(newPost)
    .then(function(res) {
      expect(res).to.have.status(201);
      expect(res).to.be.json;
      expect(res.body).to.be.a('object');
      expect(res.body).to.include.keys(
        'id', 'title', 'content', 'author', 'created');
      expect(res.body.title).to.equal(newPost.title);
      expect(res.body.id).to.not.be.null;
      expect(res.body.content).to.equal(newPost.content);
      expect(res.body.author).to.equal(newPost.author);
    })
    .then(function(post) {
        expect(post.title).to.equal(newPost.title);
        expect(post.content).to.equal(newPost.content);
        expect(post.author.firtName).to.equal(newPost.author.firtName);
        expect(post.author.lastName).to.equal(newPost.author.lastName);
        expect(post.created).to.equal(newPost.created);
      });
  });
});

describe('PUT endpoint', function() {

    it('should update fields you send over', function() {
      const updateData = {
        title: 'fleetflootmcflight',
        content: 'big beaner tdtdtddtdttd'
      };

      return post
        .findOne()
        .then(function(post) {
          updateData.id = post.id;

          return chai.request(app)
            .put(`/posts/${blogpost.id}`)
            .send(updateData);
        })
        .then(function(res){
            expect(res).to.have.status(204);

            return BlogPost.findById(updateData.id);
        })
        .then(function(post) {
            expect(post.title).to.equal(updateData.title);
            expect(post.content).to.equal(updateData.content);
          });
      });
    });

    describe('DELETE endpoint', function() {
        
        it('delete a post by id', function() {
    
          let post;
    
          return BlogPost
            .findOne()
            .then(function(_post) {
                post = _post;
              return chai.request(app).delete(`/posts/${post.id}`);
            })
            .then(function(res) {
              expect(res).to.have.status(204);
              return BlogPost.findById(post.id);
            })
            .then(function(_restaurant) {
              expect(_post).to.be.null;
            });
        });
      });
    });