const mongoose = require("mongoose")
const fs = require("fs")

const productSchema = new mongoose.Schema({
    userId: String,
    name: String,
    manufacturer: String,
    description: String,
    mainPepper: String,
    imageUrl: String,
    heat: {type: Number, min: 1, max: 5},
    likes: Number,
    dislikes: Number,
    usersLiked: [String],
    usersDisliked: [String]
})

const Product = new mongoose.model("Product", productSchema)

function theSauces(req, res) {
        Product.find({})
        .then((products) => res.send(products))
        .catch((error) => res.status(500).send(error))
    }

function theSauce(req, res) {
    const {id} = req.params
    return Product.findById(id)
}

function theSauceId(req, res) {
    theSauce(req,res)
    .then((product) => sendClientResponse(product, res))
    .catch((err) => res.status(500).send(err))
}

function deleteSauce(req, res) {
    const {id} = req.params
    Product.findByIdAndDelete(id)
    .then((product) => res.send({message: product}))
    .catch((err) => res.status(500).send({ message: err }))
}

function deleteImage(product) {
    const imageToDelete = product.imageUrl.split('/images/')[1];
    fs.unlink(`images/${imageToDelete}`, () => {
        Product.findByIdAndDelete({_id: req.params.id})
            .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
            .catch(error => res.status(401).json({ error }));
    });
}

function modifySauce(req, res) {
    const {
        params: {id}
    } = req

    const hasNewImage = req.file !=null
    const payload = makePayload(hasNewImage, req)

    Product.findByIdAndUpdate(id, payload)
    .then((dbResponse) => sendClientResponse(dbResponse, res))
    .then((product) => deleteImage(product))
    .then((res) => console.log("FILE DELETED", res))
    .catch((err) => console.error("PROBLEM UPDATING", err))
}

function makePayload(hasNewImage, req) {
    console.log("hasNewImage:", hasNewImage)
    if (!hasNewImage) return req.body
    const payload = JSON.parse(req.body.sauce)
    payload.imageUrl = makeImageUrl(req, req.file.fileName)
    console.log("NOUVELLE IMAGE A GERER")
    console.log("Voici le payload:", payload)
    return payload
}

function sendClientResponse(product, res) {
    if (product == null) {
        console.log("NOTHING TO UPDATE")
        return res.status(404).send({message: "Object not found in database"})
    }
    console.log("ALL GOOD, UPDATING", product)
    return Promise.resolve(res.status(200).send(product)).then(() => product)
}

function makeImageUrl(req) {
    return `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
}

function createSauce(req, res) {
    const {body} = req
    const sauce = JSON.parse(body.sauce)
    const { name, manufacturer, description, mainPepper, heat, userId} = sauce

    const product = new Product({
        userId: userId,
        name: name,
        manufacturer: manufacturer,
        description: description,
        mainPepper: mainPepper,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        heat: heat,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    })
    product
    .save()
    .then((message)=> res.status(201).send({message}))
    .catch((err) => res.status(500).send(err))
}

function likeSauce(req, res) {
    const {like, userId} = req.body
    if (![1, -1, 0].includes(like)) return res.status(403).send({message: "Invalid like value"})

    theSauce(req, res)
    .then((product) => updateVote(product, like, userId, res))
    .then((pr) => pr.save())
    .then((prod) => sendClientResponse(prod, res))
    .catch((err) => res.status(500).send(err))
}

function updateVote(product, like, userId, res) {
    if (like === 1 || like === -1) return incrementVote(product, userId, like)
    return resetVote(product, userId, res)
}

function resetVote(product, userId, res) {
    const {usersLiked, usersDisliked} = product
    if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId))) 
    return Promise.reject("User seems to have voted both ways")

    if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId)))
    return Promise.reject("User seems to have not voted")

    if (usersLiked.includes(userId)) {
        --product.likes
        product.usersLiked = product.usersLiked.filter((id) => id !== userId)
       } else {
        --product.dislikes
        product.usersDisliked = product.usersDisliked.filter((id) => id !== userId)
       }
       return product
    }

function incrementVote(product, userId, like) {
    const { usersLiked, usersDisliked } = product

    const votersArray = like === 1 ? usersLiked : usersDisliked
    if (votersArray.includes(userId)) return product
    votersArray.push(userId)

    like === 1 ? ++product.likes : ++product.dislikes
    return product
}


module.exports = {theSauces, createSauce, theSauceId, deleteSauce, modifySauce, likeSauce}