const puppeteer = require('puppeteer')
const fs = require('fs')

require('dotenv').config()

const CREDS = {
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD
}

async function main() {

    let payload = {
        channels: []
    }
    const browser = await puppeteer.launch({
        headless: true
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
    let completedArray = []
    for (let countRow = 1; countRow < lengthRows; countRow++) {
        await page.evaluate((data) => {
            const rows = document.querySelectorAll('div.objbox table tbody')[0].getElementsBySelector('tr')
            rows[data.countRow].className += ' rowselected'
            rows[data.countRow].getElementsByTagName('td')[0].click()
        }, {
            countRow
        })
        const element = await page.$('.rowselected')
        await element.click({
            clickCount: 2
        })
        await page.waitFor(6000)
        const channelName = await page.$('#programRequestRequestNameRoDiv')
        const textChannelName = await (await channelName.getProperty('textContent')).jsonValue();

        const obsTextarea = await page.$('#programRequestComments')
        const textobsTextarea = await (await obsTextarea.getProperty('textContent')).jsonValue();

        const arrayObject = await page.evaluate(() => {
            let arrayObject = []
            const arrayTR = document.querySelectorAll('div.objbox table tbody tr')
            for (let index = 1; index < arrayTR.length; index++) {
                let objectTD = {}
                objectTD.channelNumber = arrayTR[index].querySelectorAll('td')[2].textContent
                objectTD.channelName = arrayTR[index].querySelectorAll('td')[4].textContent
                arrayObject.push(objectTD)
            }
            return arrayObject
        })
        let response = {
            arrayObject,
            textChannelName,
            textobsTextarea
        }
        completedArray.push(response)
        await hendlerPage(page)
    }
    console.log(completedArray)
    browser.close()
    // fs.writeFile('payload.json', JSON.stringify(completedArray), function (err) {
    //     if (err) throw err;
    //     console.log('Saved!');
    // });

    completedArray.map(parentObj => {
        const regex = /([1-9]|0[1-9]|[1,2][0-9]|3[0,1])\/(0[1-9]|1[0,1,2])/g
        //=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-===-=-=-=-=-=-=-=-=-=-=-=
        let dataI = parentObj.textobsTextarea.match(regex)[0]
        let dataT = parentObj.textobsTextarea.match(regex)[1]
        //=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-===-=-=-=-=-=-=-=-=-=-=-=
        let dataISplit = dataI.split('/')[0]
        let dataTSplit = dataT.split('/')[0]
        //=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-===-=-=-=-=-=-=-=-=-=-=-=
        let dataIparse = (parseInt(dataISplit) + 1) < 10 ? `0${parseInt(dataISplit) + 1}` : parseInt(dataISplit) + 1
        let dataTparse = (parseInt(dataTSplit) - 1) < 10 ? `0${parseInt(dataTSplit) - 1}` : parseInt(dataTSplit) - 1
        //=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-===-=-=-=-=-=-=-=-=-=-=-=
        let inicio = dataI.replace(dataISplit, dataIparse)
        let termino = dataT.replace(dataTSplit, dataTparse)

        let dateObj = { inicio, termino }
        console.log(dateObj)
        console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-')
    })

}

async function hendlerPage(page) {
    await page.goto(process.env.PG_INDEX)
    await page.waitFor(1000)
    await page.evaluate(async () => {
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