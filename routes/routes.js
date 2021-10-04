const express = require('express')
const router = express.Router()
const User = require('../models/users')
const multer = require('multer')
const fs = require('fs')

// image upload

let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    }
})

let upload = multer({
    storage: storage,
}).single('image')

// insert a user in database
router.post('/new', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        url: req.body.url,
        details: req.body.details,
        image: req.file.filename
    })
    user.save((err) => {
        if(err) {
            res.json({ message: err.message, type: 'danger' })
        }
        else {
            req.session.message = {
                type: 'success',
                message:  'User added successfully!',
            }
            res.redirect('/')
        }
    })
})


// get all users
router.get('/', (req, res) => {
    User.find().exec((err, users) => {
        if(err) {
            res.json({ message: err.message })
        }
        else {
            res.render('index', {
                title: 'Home Page',
                users: users,
            })
        }
    })
})

// get user detail
router.get('/show/:id', (req, res) => {
    let id = req.params.id;
    User.findById(id, (err, user) => {
        if(err) {
            res.redirect('/')
        }
        else {
            if(user === null) {
                res.redirect('/')
            }
            else {
                res.render('show_user', {
                    title: 'Show User',
                    user: user,
                })
            }
        }
    })
})

router.get('/new', (req, res) => {
    res.render('add_users', { title: 'Add Users' })
})

// edit a user 
router.get('/edit/:id', (req, res) => {
    let id = req.params.id
    
    User.findById(id, (err, user) => {
        if(err) {
            res.redirect('/')
        }
        else {
            if(user === null) {
                res.redirect('/')
            }
            else {
                res.render('edit_user', {
                    title: 'Edit User',
                    user: user,
                })
            }
        }
    })

})

// update user
router.post('/edit/:id', upload, (req, res) => {
    let id = req.params.id
    let new_image = ''

    if(req.file) {
        new_image = req.file.filename
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image)
        } catch(err) {
            if(err) {
                console.log(err)
            }
        }
    }
    else {
        new_image = req.body.old_image
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        url: req.body.email,
        details: req.body.details,
        image: new_image,
    }, (err, result) => {
        if(err) {
            res.json({ message: err.message, type: 'danger' })
        }
        else {
            req.session.message = {
                type: 'success',
                message: 'User updated successfully!'
            }
            res.redirect('/')
        }
    })
})

// delete user
router.get('/delete/:id', (req, res) => {
    let id = req.params.id

    User.findByIdAndRemove(id, (err, result) => {
        if(result.image != '') {
            try {
                fs.unlinkSync('./uploads/' + result.image)
            } catch(err) {
                console.log(err)
            }
        }

        if(err) {
            res.json({ message: err.message })
        }
        else {
            req.session.message = {
                type: 'info',
                message: 'User deleted successfully!'
            }
            res.redirect('/')
        }
    })
})

module.exports = router