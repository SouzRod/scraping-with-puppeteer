const puppeteer = require('puppeteer')
require('dotenv').config()

const CREDS = {
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD
}

async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(process.env.PG_LOGIN);
    await page.type('#username', CREDS.username);
    await page.type('#password', CREDS.password);
    await page.click('#loginLabel')
    await page.waitForNavigation()
    await page.goto(process.env.PG_INDEX);
    await page.evaluate(async() => {
        const selectionCategory = document.getElementById('programRequestCategoryId')
        const optionsCategory = selectionCategory.getElementsByTagName('option')
        for (var item of optionsCategory) {
            if (item.value == 14) {
                item.selected = 'selected'
            }
        }
        const selectionDepartment = document.getElementById('programRequestDepartmentId')
        const optionsDepartment = selectionDepartment.getElementsByTagName('option')
        for (var item of optionsDepartment) {
            if (item.value == 13) {
                item.selected = 'selected'
            }
        }
        const selectionPeople = document.getElementById('peopleId')
        const optionsPeople = selectionPeople.getElementsByTagName('option')
        for (var item of optionsPeople) {
            if (item.value == 10233) {
                item.selected = 'selected'
            }
        }
        const selectionStatus = document.getElementById('programRequestStatusId')
        const optionsStatus = selectionStatus.getElementsByTagName('option')
        for (var item of optionsStatus) {
            if (item.value == 3) {
                item.selected = 'selected'
            }
        }

    })
    await page.click('#searchButtonTd')
    await page.waitFor(5000)
    await page.evaluate(async() => {
            let rows = document.querySelectorAll('div.objbox table tbody')[0].getElementsBySelector('tr')
            rows[1].getElementsByTagName('td')[0].click()
            rows[1].className += ' rowselected'
        })
        // browser.close()
}

main()