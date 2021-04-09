// ==UserScript==
// @name         Ebay Price Companion
// @namespace    https://github.com/TheRealKerel/ebay-price-companion
// @version      0.1.1
// @description  Calculates statistics for sold items and tries to calculate complete price incl. shipping on normal overview.
// @author       Kerel
// @match        https://www.ebay.de/*
// @updateURL    https://github.com/TheRealKerel/ebay-price-companion/raw/main/ebay-price-companion.user.js
// @grant        none
// ==/UserScript==

/* Only execute when the search is for sold items */
if (/&LH_Sold=1/.test(location.search)) {
    let body = document.getElementsByTagName('body')[0];

    /* Create and add modal */
    let modal = document.createElement('div');
    modal.id = 'stats-modal';
    modal.style = 'display: none; position: fixed; z-index: 10; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgb(0,0,0); background-color: rgba(0,0,0,0.4); -webkit-animation-name: fadeIn; -webkit-animation-duration: 0.4s; animation-name: fadeIn; animation-duration: 0.4s;'
    body.appendChild(modal);

    let modal_content = document.createElement('div');
    modal_content.style = 'position: fixed; bottom: 0; background-color: #fefefe; width: 100%; min-height: 30%; -webkit-animation-name: slideIn; -webkit-animation-duration: 0.4s; animation-name: slideIn; animation-duration: 0.4s';
    modal.appendChild(modal_content);

    let modal_header = document.createElement('div');
    modal_header.style = 'padding: 2px 16px; background-color: #5cb85c; color: white;';
    modal_content.appendChild(modal_header);

    let modal_header_close = document.createElement('span');
    modal_header_close.style = 'color: white; float: right; font-size: 28px; font-weight: bold; margin-top: 13px; cursor: pointer;';
    modal_header_close.innerHTML = '&times;';
    modal_header.appendChild(modal_header_close);
    modal_header_close.onclick = function(event) {
        event.preventDefault();
        modal.style.display = 'none';
    };

    let modal_header_heading = document.createElement('h2');
    modal_header_heading.innerText = 'Statistiken';
    modal_header.appendChild(modal_header_heading);

    let modal_body = document.createElement('div');
    modal_body.style = 'padding: 20px 16px;';
    modal_content.appendChild(modal_body);

    let min_div = document.createElement('div');
    min_div.style = 'display: inline-block; margin: 0px 25px;';
    min_div.innerHTML = '<h1 style="margin-top: 0;">Min-Preis</h1><h3 style="margin: 5px 0;">Lokal</h3><div><span id="value-min_wout_shipping_local" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-min_incl_shipping_local" style="font-size: 150%;"></span> (mit Versand)</div>';
    min_div.innerHTML += '<h3 style="margin: 20px 0 5px 0;">International</h3><div><span id="value-min_wout_shipping_international" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-min_incl_shipping_international" style="font-size: 150%;"></span> (mit Versand)</div>';
    min_div.innerHTML += '<h3 style="margin: 20px 0 5px 0;">Insgesamt</h3><div><span id="value-min_wout_shipping_complete" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-min_incl_shipping_complete" style="font-size: 150%;"></span> (mit Versand)</div>';
    modal_body.appendChild(min_div);

    let max_div = document.createElement('div');
    max_div.style = 'display: inline-block; margin: 0px 25px;';
    max_div.innerHTML = '<h1 style="margin-top: 0;">Max-Preis</h1><h3 style="margin: 5px 0;">Lokal</h3><div><span id="value-max_wout_shipping_local" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-max_incl_shipping_local" style="font-size: 150%;"></span> (mit Versand)</div>';
    max_div.innerHTML += '<h3 style="margin: 20px 0 5px 0;">International</h3><div><span id="value-max_wout_shipping_international" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-max_incl_shipping_international" style="font-size: 150%;"></span> (mit Versand)</div>';
    max_div.innerHTML += '<h3 style="margin: 20px 0 5px 0;">Insgesamt</h3><div><span id="value-max_wout_shipping_complete" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-max_incl_shipping_complete" style="font-size: 150%;"></span> (mit Versand)</div>';
    modal_body.appendChild(max_div);

    let median_div = document.createElement('div');
    median_div.style = 'display: inline-block; margin: 0px 25px;';
    median_div.innerHTML = '<h1 style="margin-top: 0;">Median</h1><h3 style="margin: 5px 0;">Lokal</h3><div><span id="value-median_wout_shipping_local" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-median_incl_shipping_local" style="font-size: 150%;"></span> (mit Versand)</div>';
    median_div.innerHTML += '<h3 style="margin: 20px 0 5px 0;">International</h3><div><span id="value-median_wout_shipping_international" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-median_incl_shipping_international" style="font-size: 150%;"></span> (mit Versand)</div>';
    median_div.innerHTML += '<h3 style="margin: 20px 0 5px 0;">Insgesamt</h3><div><span id="value-median_wout_shipping_complete" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-median_incl_shipping_complete" style="font-size: 150%;"></span> (mit Versand)</div>';
    modal_body.appendChild(median_div);

    let avg_div = document.createElement('div');
    avg_div.style = 'display: inline-block; margin: 0px 25px;';
    avg_div.innerHTML = '<h1 style="margin-top: 0;">Durchschnittspreis</h1><h3 style="margin: 5px 0;">Lokal</h3><div><span id="value-price_avg_wout_shipping_local" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-price_avg_incl_shipping_local" style="font-size: 150%;"></span> (mit Versand)</div>';
    avg_div.innerHTML += '<h3 style="margin: 20px 0 5px 0;">International</h3><div><span id="value-price_avg_wout_shipping_international" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-price_avg_incl_shipping_international" style="font-size: 150%;"></span> (mit Versand)</div>';
    avg_div.innerHTML += '<h3 style="margin: 20px 0 5px 0;">Insgesamt</h3><div><span id="value-price_avg_wout_shipping_complete" style="font-size: 150%;"></span> (ohne Versand)</div><div><span id="value-price_avg_incl_shipping_complete" style="font-size: 150%;"></span> (mit Versand)</div>';
    modal_body.appendChild(avg_div);

    window.onclick = function(event) {
        if (event.target === modal) {
            event.preventDefault();
            modal.style.display = 'none';
        }
    };

    /* Create and add modal toggle button */
    let toggle_modal_btn = document.createElement('button');
    toggle_modal_btn.id = 'toggle-modal-btn';
    toggle_modal_btn.innerText = 'Statistiken anzeigen';
    toggle_modal_btn.style = 'position:fixed; width:150px; height:50px; bottom:15px; right:15px; background-color: rgb(92, 184, 92); color:#FFF; border-radius:50px; text-align:center; box-shadow: 2px 2px 3px #999; border-style: none;';
    body.appendChild(toggle_modal_btn);
    toggle_modal_btn.onclick = function(event) {
        event.preventDefault();
        console.clear();
        let data = collect_data();
        let values = calculate_avg_complete_price_values(data);
        display_data(values);
        modal.style.display = 'block';
    };

    /* !FUNKTIONIERT NUR BEI VERKAUFTEN ANGEBOTEN! */
    let count_local = 0;
    let count_international = 0;
    let count_complete = 0;
    function collect_data() {
        let results = document.getElementsByClassName('srp-results');
        let items = results[0].children;
        let results_information = [];
        let index = 0;
        let origin = 'local';

        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            if (item.nodeName === 'LI') {
                results_information[index] = {};
                let collect_information;

                //Title
                collect_information = item.getElementsByTagName('h3');
                results_information[index].title = collect_information[0].innerText;

                //Sell date
                collect_information = item.getElementsByClassName('s-item__title--tagblock');
                results_information[index].date_sold = collect_information[0].innerText;

                //Price
                collect_information = item.getElementsByClassName('s-item__price');
                results_information[index].price = collect_information[0].innerText;

                //Shipping
                collect_information = item.getElementsByClassName('s-item__logisticsCost');
                results_information[index].shipping = collect_information[0].innerText;

                //Coutry of Listing
                collect_information = item.getElementsByClassName('s-item__itemLocation');
                if (collect_information.length !== 0) {
                    results_information[index].location = collect_information[0].innerText;
                } else {
                    results_information[index].location = 'Deutschland';
                }

                //Check if listing was auction and amount of bids
                collect_information = item.getElementsByClassName('s-item__bidCount');
                if (collect_information.length !== 0) {
                    results_information[index].bids = collect_information[0].innerText;
                    results_information[index].type = 'Auktion';
                }

                //Get listing type
                collect_information = item.getElementsByClassName('s-item__purchase-options-with-icon');
                if (collect_information.length !== 0) {
                    results_information[index].bids = null;
                    results_information[index].type = collect_information[0].innerText;
                }

                //Set origin of listing
                results_information[index].origin = origin;

                index++;
                if (origin === 'local') {
                    count_local++;
                } else if (origin === 'international') {
                    count_international++;
                }
                count_complete++;
            } else {
                let temp = item.getElementsByClassName('page-notice__content');
                if (temp.length > 0) {
                    if (temp[0].innerText.includes('internationalen')) {
                        origin = 'international';
                    }
                    if (temp[0].innerText.includes('weniger')) {
                        console.log('%cStoppe Loop vor Treffern für weniger Suchbegriffe nach ' + index + ' Anzeige(n)!\n%cLetzte analysierte Anzeige:\n%c"' + results_information[index - 1].title + '" für ' + results_information[index - 1].price, 'color: red;', 'color: inherit;','font-style: italic;');
                        break;
                    }
                }
            }
        }
        return results_information;
    }

    function calculate_avg_complete_price_values(data) {
        //total prices without shipping for avg calcultion
        let price_total_wout_shipping_local = 0;
        let price_total_wout_shipping_international = 0;
        let price_total_wout_shipping_complete = 0;

        //total prices with shipping for avg calcultion
        let price_total_incl_shipping_local = 0;
        let price_total_incl_shipping_international = 0;
        let price_total_incl_shipping_complete = 0;

        //medians without shipping
        let median_wout_shipping_local = 0;
        let median_wout_shipping_international = 0;
        let median_wout_shipping_complete = 0;

        //medians with shipping
        let median_incl_shipping_local = 0
        let median_incl_shipping_international = 0
        let median_incl_shipping_complete = 0

        //price average without shipping
        let price_avg_wout_shipping_local = 0;
        let price_avg_wout_shipping_international = 0;
        let price_avg_wout_shipping_complete = 0;

        //price average with shipping
        let price_avg_incl_shipping_local = 0;
        let price_avg_incl_shipping_international = 0;
        let price_avg_incl_shipping_complete = 0;

        //array to collect prices without shipping
        let prices_wout_shipping_local = [];
        let prices_wout_shipping_international = [];
        let prices_wout_shipping_complete = [];

        //array to collect prices with shipping
        let prices_incl_shipping_local = [];
        let prices_incl_shipping_international = [];
        let prices_incl_shipping_complete = [];

        for (let i = 0; i < data.length; i++) {
            let price = Number(data[i].price.replace(/[^0-9\,]+/g,"").replace(/,/g, '.')); //Preis Artikel

            if (data[i].origin === 'local') {
                prices_wout_shipping_local.push(price);
            } else if (data[i].origin === 'international') {
                prices_wout_shipping_international.push(price);
            } else {
                console.log('%cCouldn\'t get origin of listing!', 'color: red;');
            }
            prices_wout_shipping_complete.push(price);

            if (data[i].origin === 'local') {
                price_total_wout_shipping_local = +(price_total_wout_shipping_local + price).toFixed(12); //Gesamtpreis lokal ohne Versand
            } else if (data[i].origin === 'international') {
                price_total_wout_shipping_international = +(price_total_wout_shipping_international + price).toFixed(12); //Gesamtpreis international ohne Versand
            }
            price_total_wout_shipping_complete = +(price_total_wout_shipping_complete + price).toFixed(12); //Gesamtpreis ohne Versand

            let shipping = Number(data[i].shipping.replace(/[^0-9\,]+/g,"").replace(/,/g, '.')); //Preis Versand Artikel
            let price_incl_shipping = +(price + shipping).toFixed(12); //wichtig so zu addieren weil Kommazahlen, Preis Artikel + Versand

            if (data[i].origin === 'local') {
                prices_incl_shipping_local.push(price_incl_shipping);
            } else if (data[i].origin === 'international') {
                prices_incl_shipping_international.push(price_incl_shipping);
            }
            prices_incl_shipping_complete.push(price_incl_shipping);

            if (data[i].origin === 'local') {
                price_total_incl_shipping_local = +(price_total_incl_shipping_local + price_incl_shipping).toFixed(12); //Gesamtpreis lokal inkl. Versand
            } else if (data[i].origin === 'international') {
                price_total_incl_shipping_international = +(price_total_incl_shipping_international + price_incl_shipping).toFixed(12); //Gesamtpreis international inkl. Versand
            }
            price_total_incl_shipping_complete = +(price_total_incl_shipping_complete + price_incl_shipping).toFixed(12); //Gesamtpreis inkl. Versand
        }

        /* Min & Max values */
        let min_wout_shipping_local = '-';
        if (prices_wout_shipping_local.length !== 0) {
            min_wout_shipping_local = Math.min(...prices_wout_shipping_local).toFixed(2);
        }
        let min_wout_shipping_international = '-';
        if (prices_wout_shipping_international.length !== 0) {
            min_wout_shipping_international = Math.min(...prices_wout_shipping_international).toFixed(2);
        }
        let min_wout_shipping_complete = '-';
        if (prices_wout_shipping_complete.length !== 0) {
            min_wout_shipping_complete = Math.min(...prices_wout_shipping_complete).toFixed(2);
        }

        let min_incl_shipping_local = '-';
        if (prices_incl_shipping_local.length !== 0) {
            min_incl_shipping_local = Math.min(...prices_incl_shipping_local).toFixed(2);
        }
        let min_incl_shipping_international = '-';
        if (prices_incl_shipping_international.length !== 0) {
            min_incl_shipping_international = Math.min(...prices_incl_shipping_international).toFixed(2);
        }
        let min_incl_shipping_complete = '-';
        if (prices_incl_shipping_complete.length !== 0) {
            min_incl_shipping_complete = Math.min(...prices_incl_shipping_complete).toFixed(2);
        }

        let max_wout_shipping_local = '-';
        if (prices_wout_shipping_local.length !== 0) {
            max_wout_shipping_local = Math.max(...prices_wout_shipping_local).toFixed(2);
        }
        let max_wout_shipping_international = '-';
        if (prices_wout_shipping_international.length !== 0) {
            max_wout_shipping_international = Math.max(...prices_wout_shipping_international).toFixed(2);
        }
        let max_wout_shipping_complete = '-';
        if (prices_wout_shipping_complete.length !== 0) {
            max_wout_shipping_complete = Math.max(...prices_wout_shipping_complete).toFixed(2);
        }

        let max_incl_shipping_local = '-';
        if (prices_incl_shipping_local.length !== 0) {
            max_incl_shipping_local = Math.max(...prices_incl_shipping_local).toFixed(2);
        }
        let max_incl_shipping_international = '-';
        if (prices_incl_shipping_international.length !== 0) {
            max_incl_shipping_international = Math.max(...prices_incl_shipping_international).toFixed(2);
        }
        let max_incl_shipping_complete = '-';
        if (prices_incl_shipping_complete.length !== 0) {
            max_incl_shipping_complete = Math.max(...prices_incl_shipping_complete).toFixed(2);
        }

        /* Calculate Median without shipping */
        median_wout_shipping_local = '-';
        if (prices_wout_shipping_local.length !== 0) {
            prices_wout_shipping_local.sort(function(a,b) {
                return a - b;
            });
            let half = Math.floor(prices_wout_shipping_local.length / 2);
            if (prices_wout_shipping_local.length % 2 === 0) {
                median_wout_shipping_local = ((prices_wout_shipping_local[half - 1] + prices_wout_shipping_local[half]) / 2.0).toFixed(2);
            } else {
                median_wout_shipping_local = prices_wout_shipping_local[half].toFixed(2);
            }
        }
        median_wout_shipping_international = '-';
        if (prices_wout_shipping_international.length !== 0) {
            prices_wout_shipping_international.sort(function(a,b) {
                return a - b;
            });
            let half = Math.floor(prices_wout_shipping_international.length / 2);
            if (prices_wout_shipping_international.length % 2 === 0) {
                median_wout_shipping_international = ((prices_wout_shipping_international[half - 1] + prices_wout_shipping_international[half]) / 2.0).toFixed(2);
            } else {
                median_wout_shipping_international = prices_wout_shipping_international[half].toFixed(2);
            }
        }
        median_wout_shipping_complete = '-';
        if (prices_wout_shipping_complete.length !== 0) {
            prices_wout_shipping_complete.sort(function(a,b) {
                return a - b;
            });
            let half = Math.floor(prices_wout_shipping_complete.length / 2);
            if (prices_wout_shipping_complete.length % 2 === 0) {
                median_wout_shipping_complete = ((prices_wout_shipping_complete[half - 1] + prices_wout_shipping_complete[half]) / 2.0).toFixed(2);
            } else {
                median_wout_shipping_complete = prices_wout_shipping_complete[half].toFixed(2);
            }
        }

        /* Calculate Median with shipping */
        median_incl_shipping_local = '-';
        if (prices_incl_shipping_local.length !== 0) {
            prices_incl_shipping_local.sort(function(a,b) {
                return a - b;
            });
            let half = Math.floor(prices_incl_shipping_local.length / 2);
            if (prices_incl_shipping_local.length % 2 === 0) {
                median_incl_shipping_local = ((prices_incl_shipping_local[half - 1] + prices_incl_shipping_local[half]) / 2.0).toFixed(2);
            } else {
                median_incl_shipping_local = prices_incl_shipping_local[half].toFixed(2);
            }
        }
        median_incl_shipping_international = '-';
        if (prices_incl_shipping_international.length !== 0) {
            prices_incl_shipping_international.sort(function(a,b) {
                return a - b;
            });
            let half = Math.floor(prices_incl_shipping_international.length / 2);
            if (prices_incl_shipping_international.length % 2 === 0) {
                median_incl_shipping_international = ((prices_incl_shipping_international[half - 1] + prices_incl_shipping_international[half]) / 2.0).toFixed(2);
            } else {
                median_incl_shipping_international = prices_incl_shipping_international[half].toFixed(2);
            }
        }
        median_incl_shipping_complete = '-';
        if (prices_incl_shipping_complete.length !== 0) {
            prices_incl_shipping_complete.sort(function(a,b) {
                return a - b;
            });
            let half = Math.floor(prices_incl_shipping_complete.length / 2);
            if (prices_incl_shipping_complete.length % 2 === 0) {
                median_incl_shipping_complete = ((prices_incl_shipping_complete[half - 1] + prices_incl_shipping_complete[half]) / 2.0).toFixed(2);
            } else {
                median_incl_shipping_complete = prices_incl_shipping_complete[half].toFixed(2);
            }
        }

        /* Calculate Average Price */
        price_avg_wout_shipping_local = '-';
        if (count_local !== 0) {
            price_avg_wout_shipping_local = (price_total_wout_shipping_local / count_local).toFixed(2);
        }
        price_avg_wout_shipping_international = '-';
        if (count_international !== 0) {
            price_avg_wout_shipping_international = (price_total_wout_shipping_international / count_international).toFixed(2);
        }
        price_avg_wout_shipping_complete = '-';
        if (count_complete !== 0) {
            price_avg_wout_shipping_complete = (price_total_wout_shipping_complete / count_complete).toFixed(2);
        }

        price_avg_incl_shipping_local = '-';
        if (count_local !== 0) {
            price_avg_incl_shipping_local = (price_total_incl_shipping_local / count_local).toFixed(2);
        }
        price_avg_incl_shipping_international = '-';
        if (count_international !== 0) {
            price_avg_incl_shipping_international = (price_total_incl_shipping_international / count_international).toFixed(2);
        }
        price_avg_incl_shipping_complete = '-';
        if (count_complete !== 0) {
            price_avg_incl_shipping_complete = (price_total_incl_shipping_complete / count_complete).toFixed(2);
        }

        let values = [];
        values.min_wout_shipping_local = min_wout_shipping_local;
        values.min_wout_shipping_international = min_wout_shipping_international;
        values.min_wout_shipping_complete = min_wout_shipping_complete;

        values.min_incl_shipping_local = min_incl_shipping_local;
        values.min_incl_shipping_international = min_incl_shipping_international;
        values.min_incl_shipping_complete = min_incl_shipping_complete;

        values.max_wout_shipping_local = max_wout_shipping_local;
        values.max_wout_shipping_international = max_wout_shipping_international;
        values.max_wout_shipping_complete = max_wout_shipping_complete;

        values.max_incl_shipping_local = max_incl_shipping_local;
        values.max_incl_shipping_international = max_incl_shipping_international;
        values.max_incl_shipping_complete = max_incl_shipping_complete;

        values.median_wout_shipping_local = median_wout_shipping_local;
        values.median_wout_shipping_international = median_wout_shipping_international;
        values.median_wout_shipping_complete = median_wout_shipping_complete;

        values.median_incl_shipping_local = median_incl_shipping_local;
        values.median_incl_shipping_international = median_incl_shipping_international;
        values.median_incl_shipping_complete = median_incl_shipping_complete;

        values.price_avg_wout_shipping_local = price_avg_wout_shipping_local;
        values.price_avg_wout_shipping_international = price_avg_wout_shipping_international;
        values.price_avg_wout_shipping_complete = price_avg_wout_shipping_complete;

        values.price_avg_incl_shipping_local = price_avg_incl_shipping_local;
        values.price_avg_incl_shipping_international = price_avg_incl_shipping_international;
        values.price_avg_incl_shipping_complete = price_avg_incl_shipping_complete;

        return values;
    }

    function display_data(values) {
        let keys = Object.keys(values);
        for (let i = 0; i < keys.length; i++) {
            let div = document.getElementById('value-' + keys[i])
            div.innerText = values[keys[i]];
        }
    }
}


//Calculate price incl. shipping and display it in listing
try {
    let items = document.getElementsByClassName('srp-results')[0].children;

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.nodeName === 'LI') {
            let price = Number(item.getElementsByClassName('s-item__price')[0].innerText.replace(/[^0-9\,]+/g,"").replace(/,/g, '.'));
            let shipping = Number(item.getElementsByClassName('s-item__shipping')[0].innerText.replace(/[^0-9\,]+/g,"").replace(/,/g, '.'));
            let allin = +(price + shipping).toFixed(2);
            allin = (Math.round(allin * 100) / 100).toFixed(2).toString().replace(/\./g, ',');

            let appendTo = item.getElementsByClassName('s-item__info')[0]
            let info = document.createElement('div');
            info.style = 'margin-top: 5px; font-size: 20px;';
            info.innerHTML = '<i>Gesamt: ' + allin + ' €</i>';
            appendTo.appendChild(info);
        }
    }
}
catch (e) {
    console.log('Calculate price in overview: ' + e);
}

//calculate complete price on listing details site
try {
    let price = Number(document.getElementById('prcIsum').innerText.replace(/[^0-9\,]+/g,"").replace(/,/g, '.'));
    let converted_price = document.getElementById('convbinPrice');
    if (converted_price !== null) {
        price = Number(converted_price.innerText.replace(/[^0-9\,]+/g,"").replace(/,/g, '.'));
    }

    let shipping = Number(document.getElementById('fshippingCost').children[0].innerText.replace(/[^0-9\,]+/g,"").replace(/,/g, '.'));
    let converted_shipping = document.getElementById('convetedPriceId');
    if (converted_shipping !== null) {
        shipping = Number(converted_shipping.innerText.replace(/[^0-9\,]+/g,"").replace(/,/g, '.'));
    }

    let allin = +(price + shipping).toFixed(2);
    allin = (Math.round(allin * 100) / 100).toFixed(2).toString().replace(/\./g, ',');

    let appendTo = document.getElementById('prcIsumConv');
    let info = document.createElement('div');
    info.style = 'color: #555; font-size: 12px; font-weight: bold;';
    info.innerHTML = 'Gesamt: ' + allin;
    appendTo.parentNode.insertBefore(info, appendTo.nextSibling);

}
catch (e) {
    console.log('Calculate price in listing details: ' + e);
}
