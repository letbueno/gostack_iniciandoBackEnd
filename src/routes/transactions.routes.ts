import { Router } from 'express';
import multer from 'multer';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });
  delete transaction.created_at;
  delete transaction.updated_at;
  delete transaction.category.created_at;
  delete transaction.category.updated_at;
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const transaction = new DeleteTransactionService();
  await transaction.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const ImportTransaction = new ImportTransactionsService();

    const transaction = await ImportTransaction.execute(request.file.path);

    response.json(transaction);
  },
);

export default transactionsRouter;
