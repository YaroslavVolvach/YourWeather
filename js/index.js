const APIKey = 'b4da3c6a1133016ec728aad552241931'

const CITIES = JSON.parse(localStorage.getItem('cities')) || []

let DAYS = [];

function historySearch(){
    run(this.value)
}

function addButton(){
    let elements = document.getElementsByClassName('history-button');
    for(let element of elements){
        element.remove()
    }
    let form = document.getElementById('form')
    let html;
    for(let city of CITIES){
        html = `<button type="submit" onclick="historySearch.call(this)" class="history-button" value=${city.name}>${city.name}</button>`
        form.insertAdjacentHTML('afterend', html)
    }
    
}

async function getCityDataObject(city){
   
    let cid = CITIES.find(element => element.name === city);
    let cityData;
    if(cid){
        cityData = cid
    }else{
        let response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIKey}`, {method: "GET", "Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
        tb = document.getElementById('title-board') 
        if (response.status[0] === '4'){
            tb.innerText = 'Error: Try again'
        }else{
            tb.innerText = '5-Day Forecast:'
        }
        let data = await response.json()
        if (data[0] === undefined) {data[0] = {name: 'city', lon: '1', lat: '1'}}
        tb = document.getElementById('title-board') 
        tb.innerText = '5-Day Forecast:'
        cityData = data[0]
        let cid = CITIES.find(element => element.name === cityData);
        if(!cid){
            CITIES.push(cityData)
            localStorage.setItem('cities', JSON.stringify(CITIES))
            if(CITIES && CITIES !== []){
                addButton()
            }
        }
    }
    return cityData
}


async function getDataOfWeather(lat, lon, units='imperial'){
    let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&units=${units}`, {method: "GET", "Content-Type": "application/json", "Access-Control-Allow-Origin": "*"})
    let data = await response.json()
    return data
}


function diff_hours(dt2, dt1)  {
    dt1 = new Date(dt1);
    dt2 = new Date(dt2);
    var diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60);
    return Math.abs(Math.round(diff)) < 24;
    
   }

function avarageDailyData(dataWeather){
    DAYS = []
    let temp = 0;
    let wind = 0;
    let humidity = 0;
    let dayNumber = 0
    let daysList = dataWeather.filter(element => diff_hours(element.dt_txt, moment().format('YYYY-MM-DD HH:mm:ss')))
    let elements = document.getElementsByClassName('weather-card');
    for(let element of elements){
        element.remove()
    }
   
    while(dayNumber < 6){
        for(let data of daysList){
            temp += data.main.temp;
            humidity += data.main.humidity;
            wind += data.wind.speed 
        }
        DAYS.push({
            name: daysList[0].name,
            date: moment().add(dayNumber, 'days').format('YYYY-MM-DD'), 
            icon: daysList[0].weather[0].icon,
            temp: String((temp / 7)).slice(0, 5),
            wind: String((wind / 7)).slice(0,5),
            humidity: String((humidity / 7)).slice(0,5)
        })
        temp = 0; 
        wind = 0; 
        humidity = 0
        dayNumber ++
        daysList = dataWeather.filter(element => diff_hours(element.dt_txt, moment().add(dayNumber, 'days').format('YYYY-MM-DD HH:mm:ss')))
    }
}



function addCard(city){
    let tb = document.getElementById('title-board')
    let cr = document.getElementById("cards")
    if(cr){
       cr.remove()
    }
    let cards = document.createElement("div");
    cards.id = "cards";
    tb.appendChild(cards)
    let pCards = document.createElement("p");
    pCards.id = "p-cards"
    cards.appendChild(pCards)

    let currentDay = DAYS[0]
    let days = DAYS.slice(1)
    document.getElementById('area-title').innerHTML = `${city} (${currentDay.date})`;
    document.getElementById('area-temp').innerHTML = `Temp: ${currentDay.temp} °F`;
    document.getElementById('area-icon').src = `http://openweathermap.org/img/w/${currentDay.icon}.png`;
    document.getElementById('area-wind').innerText = `Wind: ${currentDay.wind} MPH`;
    document.getElementById('area-humidity').innerHTML = `Humidity: ${currentDay.humidity} %`;
    
    let html;
   
    for (let day of days.reverse()){
      
       html =`<div class ='weather-card'>
            <h3>${day.date}</h3>
            <h3>${city}</h3>
            <p>Temp: ${day.temp} °F</p>
            <img src=http://openweathermap.org/img/w/${day.icon}.png>
            <p>Wind: ${day.wind} MPH</p>
            <p>Humidity: ${day.humidity} %</p>
        </div>`

        pCards.insertAdjacentHTML("afterbegin", html)
    }
 
}
    

async function run(city){
    let cityData = await getCityDataObject(city)
    let dataWeather = await getDataOfWeather(cityData.lat, cityData.lon)
    avarageDailyData(dataWeather.list)
    addCard(cityData.name)
}

  
if(CITIES && CITIES !== []){
    addButton()
}


let form = document.querySelector('form');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const date = document.querySelector('input').value
    tb = document.getElementById('title-board') 
    if(date){
        tb.innerText = '5-Day Forecast:'
        run(date)
    }else{
        tb.innerText = 'Empty Value'
    }
});

document.getElementById('clear-history').onclick = (event) => {
    localStorage.clear()
    location.reload()
}
