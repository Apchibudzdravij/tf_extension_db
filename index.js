const http = require('http');
const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const Logger = require('koa-logger');
const {
    koaBody
} = require('koa-body');
const {
    PrismaClient
} = require('@prisma/client');
const prisma = new PrismaClient();

const app = new Koa;
const router = new Router;
const httpServer = http.createServer(app.callback());
const port = 7000;

app.use(koaBody());

const corsoptions = {
    origin: '*'
};
app.use(cors(corsoptions));

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.response.type = 'json';
        console.log('Error handled by Koa: ', err.message);
        ctx.body = {
            error: err.message
        };
    }
});

router.get('/', async (ctx) => {
    ctx.response.type = 'json';
    console.log('[INFO] server checked')
    ctx.body = {
        message: 'server online - no worries!'
    };
})

router.post('/upload', async (ctx) => {
    let content = ctx.request.body;
    ctx.response.type = 'json';
    if (content.parm === 'test') {
        console.log('[TEST] server tested')
        ctx.body = {
            message: 'test successfully passed'
        };
    } else if (content.parm === 'artist') {
        if (content.artist) {
            console.log('[INFO] artist provided')
            let artist = content.artist;
            let artistIbDB = await prisma.artist.findUnique({
                where: {
                    url: artist.url
                }
            });
            if (!artistIbDB) {
                artistIbDB = await prisma.artist.create({
                    data: {
                        url: artist.url,
                        name: artist.artistInfo.name,
                        location: artist.artistInfo.location,
                        summary: artist.artistInfo.summary
                    }
                });
            }
            let skillSet = [];
            let softwareSet = [];
            for (let s in artist.artistInfo.skills) {
                let existingSkill = await prisma.skill.findUnique({
                    where: {
                        name: artist.artistInfo.skills[s]
                    }
                });
                if (existingSkill) {
                    skillSet.push(existingSkill.id);
                } else {
                    let newSkill = await prisma.skill.create({
                        data: {
                            name: artist.artistInfo.skills[s]
                        }
                    });
                    skillSet.push(newSkill.id);
                }
            }
            for (let s in artist.artistInfo.software) {
                let existingSoftware = await prisma.software.findUnique({
                    where: {
                        name: artist.artistInfo.software[s]
                    }
                });
                if (existingSoftware) {
                    softwareSet.push(existingSoftware.id);
                } else {
                    let newSoftware = await prisma.software.create({
                        data: {
                            name: artist.artistInfo.software[s]
                        }
                    });
                    softwareSet.push(newSoftware.id);
                }
            }
            let commentText = artist.comment;
            let newComment = await prisma.comment.findUnique({
                where: {
                    text: commentText
                }
            })
            if (!newComment) {
                newComment = await prisma.comment.create({
                    data: {
                        text: commentText,
                        artist: {
                            connect: {
                                id: artistIbDB.id
                            }
                        }
                    }
                });
            }
            let existingVacancy = await prisma.vacancy.findUnique({
                where: {
                    name: content.vacancy
                }
            });
            if (!existingVacancy) {
                existingVacancy = await prisma.vacancy.create({
                    data: {
                        name: content.vacancy
                    }
                });
            }
            let contactSet = [];
            let tempSet = [];
            if (artist.artistInfo.contacts.contacts !== "") {
                let cntcts = artist.artistInfo.contacts.contacts.split(',');
                for (let c in cntcts) {
                    tempSet.push(cntcts[c].trim());
                }
            }
            if (artist.artistInfo.contacts.linkedin!== "") {
                tempSet.push(artist.artistInfo.contacts.linkedin);
            }
            if (artist.artistInfo.contacts.facebook !== "") {
                tempSet.push(artist.artistInfo.contacts.facebook);
            }
            if (artist.artistInfo.contacts.twitter!== "") {
                tempSet.push(artist.artistInfo.contacts.twitter);
            }
            if (artist.artistInfo.contacts.instagram!== "") {
                tempSet.push(artist.artistInfo.contacts.instagram);
            }
            for (let c in tempSet) {
                let urlString = tempSet[c];
                urlString = urlString.trim();
                let existingContact = await prisma.contact.findUnique({
                    where: {
                        url: urlString
                    }
                });
                if (existingContact) {
                    contactSet.push(existingContact.id);
                } else {
                    let newContact = await prisma.contact.create({
                        data: {
                            url: urlString,
                            artist: {
                                connect: {
                                    id: artistIbDB.id
                                }
                            }
                        }
                    });
                    contactSet.push(newContact.id);
                }
            }
            let updatedArtist = await prisma.artist.update({
                where: {
                    id: artistIbDB.id
                },
                data: {
                    skills: {
                        connect: skillSet.map(skillId => ({ id: skillId }))
                    },
                    software: {
                        connect: softwareSet.map(softwareId => ({ id: softwareId }))
                    },
                    contacts: {
                        connect: contactSet.map(contactId => ({ id: contactId }))
                    },
                    comments: {
                        connect: {
                            id: newComment.id
                        }
                    },
                    vacancies: {
                        connect: {
                            id: existingVacancy.id
                        }
                    }
                },
                include: {
                    comments: true,
                    contacts: true,
                    vacancies: true,
                    skills: true,
                    software: true
                }
            });
            console.log(JSON.stringify(updatedArtist));
            console.log('[INFO] info sent to database successfully');
            ctx.body = {
                message: 'artist achieved'
            }
        } else {
            console.error('[ERROR] artist not provided');
            ctx.body = {
                message: 'no artist provided'
            }
        }
    }
})

router.post('/download', async (ctx) => {
    let content = ctx.request.body;
    ctx.response.type = 'json';
    if (content.key === 'possum2') {
        console.log('[INFO] downloading requested');
        let result = {
            vacancies: [],
            software: [],
            skills: [],
            artists: []
        };
        result.vacancies = await prisma.vacancy.findMany();
        result.software = await prisma.software.findMany();
        result.skills = await prisma.skill.findMany();
        result.artists = await prisma.artist.findMany({
            include: {
                comments: true,
                contacts: true,
                vacancies: true,
                skills: true,
                software: true
            }
        });
        ctx.body = {
            message: 'accepted',
            data: result
        }
    } else {
        console.error('[ERROR] invalid key provided');
        ctx.body = {
            message: 'invalid key provided'
        }
    }
})

app.use(Logger())
    .use(router.routes())
    .use(router.allowedMethods());

httpServer.listen(port, () => {
    console.log(`HTTP Server started at http://[${httpServer.address().address}]:${httpServer.address().port}`);
});