const express = require('express');
const Project = require('../model/Project')
const authMiddleware = require('../middlewares/auth')

const router = express.Router();

router.use(authMiddleware)

router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().populate('user')
        res.send({ projects })
    } catch (error) {
        return res.status.send({ error: 'Error loading projects' })
    }
})

router.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate('user')
    } catch (error) {
        return res.status.send({ error: 'Error loading project' })
    }
})

router.post('/', async (req, res) => {
    try {
        const { title, description, tasks } = req.body

        const project = await Project.create({ ...req.body, user: req.userId })
        
        await Promisse.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id })
            await project.save();
            project.tasks.push(projectTask)
        }));

        await project.save()

        return res.send({ project })
    } catch (error) {
        return res.status(400).send({ error: 'Error creating project' })
    }
})

router.put('/:projectId', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.projectId, {
            new: true
        })
        return res.send({ project })
    } catch (error) {
        return res.status(400).send({ error: 'Error updating project' })
    }
})

router.delete('/:projectId', async (req, res) => {
    try {
        await Project.findByIdAndRemove(req.params.projectId)
        return res.send()
    } catch (error) {
        return res.status(400).send({ error: 'Error deleting project' })
    }
})

module.exports = app => app.use('/projects', router)