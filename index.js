const puppeteer = require('puppeteer')
require('dotenv').config()

const CREDS = {
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD
}

async function main() {
    const browser = await puppeteer.launch({
        headless: false
    })
    const page = await browser.newPage()
    await page.setViewport({
        width: 1300,
        height: 600,
        deviceScaleFactor: 1,
    });
    await page.goto(process.env.PG_LOGIN)
    await page.type('#username', CREDS.username)
    await page.type('#password', CREDS.password)
    await page.click('#loginLabel')
    await page.waitForNavigation()
    await hendlerPage(page)

    const lengthRows = await page.evaluate(() => {
        return document.querySelectorAll('div.objbox table tbody')[0].getElementsBySelector('tr').length
    })
    for (let countRow = 1; countRow < lengthRows; countRow++) {
        await page.evaluate((data) => {
            const rows = document.querySelectorAll('div.objbox table tbody')[0].getElementsBySelector('tr')
            rows[data.countRow].className += ' rowselected'
            rows[data.countRow].getElementsByTagName('td')[0].click()
        }, { countRow })
        const element = await page.$('.rowselected')
        await element.click({ clickCount: 2 })
        await page.waitFor(5000)
        const channelName = await page.$('#programRequestRequestNameRoDiv')
        const textChannelName = await (await channelName.getProperty('textContent')).jsonValue();

        const obsTextarea = await page.$('#programRequestComments')
        const textobsTextarea = await (await obsTextarea.getProperty('textContent')).jsonValue();
        // const elementTbody = await page.$('div.objbox table tbody')
        const elementXPTO = await page.evaluate(() => {
                let channelNumber
                const elementXPTO = document.querySelectorAll('div.objbox table tbody tr')
                for (const index = 1; index < elementXPTO.length; index++) {

                }
                console.log(elementXPTO)
            })
            // console.log({ textChannelName, textobsTextarea })
            // await page.evaluate(() => {
            //     console.log(`url is ${location.href}`)
            //         // setTimeout(() => {
            //         //     let textObs = document.getElementById('programRequestCommentsRoDiv').textContent
            //         //     console.log(document.getElementById('programRequestRequestNumberRoDiv'))
            //         // }, 15000)
            // })
        break
        await hendlerPage(page)
    }

    // browser.close()
}

// async function windowSet(page, name, value) {
//     return await page.evaluateOnNewDocument(`
//         Object.defineProperty(window, '${name}', {
//             get() {
//                 return '${value}'
//             }
//         })
//     `)
// }

async function hendlerPage(page) {
    await page.goto(process.env.PG_INDEX)
    await page.waitFor(1000)
    await page.evaluate(async() => {
        function selectingOptions({
            idElement,
            optionValue
        }) {
            const selection = document.getElementById(idElement)
            const options = selection.getElementsByTagName('option')
            for (let option of options) {
                if (option.value == optionValue) {
                    option.selected = 'selected'
                }
            }
        }
        selectingOptions({
            idElement: 'programRequestCategoryId',
            optionValue: 14
        })
        selectingOptions({
            idElement: 'programRequestDepartmentId',
            optionValue: 13
        })
        selectingOptions({
            idElement: 'peopleId',
            optionValue: 10233
        })
        selectingOptions({
            idElement: 'programRequestStatusId',
            optionValue: 3
        })
    })
    await page.click('#searchButtonTd')
    await page.waitFor(5000)
}

main()