//const express = require('express')
import express from 'express'
import { getNote, getNotes, createNote } from '../database.js'
export const router = express.Router()

/*
o servidor vai conter todas as imagens
? uma database 
vai receber um request com a posição do mouse relativa a tela do usuario

*/



// middleware


// response


/*
router.use(express.json())
router
    .route('/')
    // carregando html
    .get((req, res) => {
        console.log("here")
        res.render('index', {img: "poggers"})
    })
    // carregando data (img)
    .get((req, res) => {
        res,
    })
    
    router.param
*/

/*
router.use(express.json())
router
    .route('/:id')
    .get((req, res) => {
        res.send('bosta')
    })
    .get(async (req, res) => {
        const notes = await getNotes()
        res.send(notes)
    })
    .get(async (req, res) => {
        const note = await getNote(req.params.id)
        res.send(note)
    })
    .post(async (req, res) => {
        console.log(req.body)
        const { title } = req.body
        const note = await createNote(title)
        res.status(201).send(note)
        
    })
    .put((req, res) => {
        res.send(`update note with id ${req.params.id}`)
    })
    .delete((req, res) => {
        res.send(`delete note with id ${req.params.id}`)
    })

    router.param
*/