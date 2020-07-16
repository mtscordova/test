// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// add recaptcha plugin and provide it your 2captcha token (= their apiKey)
// 2captcha is the builtin solution provider but others would work as well.
// Please note: You need to add funds to your 2captcha account for this to work
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: 'f431d4df08d8c593daacb6ac286b3217' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
        },
        visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
)

const fs = require('fs');

puppeteer.launch({ headless: false }).then(async browser => {
    const page = await browser.newPage()
    await page.setRequestInterception(true);

    page.on('request', (req) => {
        if (req.resourceType() === 'image' || req.resourceType() === 'font' || req.resourceType() === 'stylesheet' || req.resourceType() === 'svg+xml') {
            req.abort();
        }
        else {
            req.continue();
        }
    });

    page.on('requestfinished', async (req) => {
        if (req.url().endsWith('/active-orders') && req.response()) {
            console.log("REQUEST ", req.headers());
            console.log("RESPONSE ", req.response());
            await page._client.send('Network.getAllCookies').then(function (cookies) {
                writeFile('cookies', filterCookie(cookies))
            }, function (reason) {
                // rechazo
            });
            writeFile("headers", req.headers());

        }
    });

    await page.goto("https://restaurant-dashboard.uber.com/").then(
        await page.waitForSelector('#useridInput')
    );

    await page.type('#useridInput', 'sanrolls6+uber14@gmail.com').then(async function () {
        await page.click('.btn--arrow')
    }, function () {
        console.log("la wea esta mala")
    });

    try {
        console.log("completando captcha")
        await page.solveRecaptchas({ timeout: 0 }).then(async function () {
            await page.click('.btn--arrow');
            console.log("captcha completado");
        }, function () {
            console.log("no ha completado el captcha")
        });
    } catch (error) {
        console.log(error)
    }

    await page.type('#password', 'uber1234').then(async function () {
        await page.click('.btn--arrow')
    }, function () {
        console.log("error al ingresar la contraseña")
    });
})

function writeFile(name, content) {
    fs.writeFile(name + ".json", JSON.stringify(content), 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("JSON file has been saved.");
    });
}

/*  Particularidades encontradas: fsid, csdi y _ua se repiten 3 veces, el dominio correcto para fsid y csdi empieza con un punto y no lo lleva para _ua
*/
function filterCookie(array) {
    return array.cookies.filter(function (el) {
        return el.name == 'marketing_vistor_id' || el.name == 'segmentCookie' || el.name == 'auth_ga_trigger'
            || el.name == '_gcl_au' || el.name == '_fbp' || el.name == '_ga' || el.name == '_gid' || el.name == 'deviceCookieID'
            || el.name == 'sid' || el.name == 'utag_main' || (el.name == 'fsid' && el.domain == '.restaurant-dashboard.uber.com')
            || (el.name == 'csid' && el.domain == '.restaurant-dashboard.uber.com') || (el.name == '_ua' && el.domain == 'restaurant-dashboard.uber.com')
            || el.name == 'user-uuid' || el.name == 'jwt-session'
    })
}


