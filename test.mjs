import { dbService } from './lib/db-service.js';
dbService.books.create({title: 'test float', author: 'test', categoryId: 1, price: 10, weight: 5})
  .then(b => console.log('Created:', b))
  .catch(e => console.error(e));
