const express = require('express')
const cors = require('cors')
const {PrismaClient} = require('@prisma/clinet')

const prisma = new PrismaClient

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req,res) => {
    res.send('API mini mercado funcionando!!')
})

app.listen(3333, () => {
    console.log('Servidor rodando na porta 3333')
})