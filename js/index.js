const searchButton = document.querySelector('.search__field button');
searchButton.addEventListener('click', changeCity);

// our main function ====================================================
async function main(city) {
    let apiKey = 'f7099511d0dcc01c8b93e1afb43c60d5';
    const searchInput = document.querySelector('.search__field input');
    
    const weekInfo = await getWeekForecast(city, apiKey);
    const todayInfo = await getWeatherData(city, apiKey);
    
    if (weekInfo && todayInfo) {
        resetAllFields();
        
        if ( searchInput.classList.contains('invalid') ) {
            resetErrorParagraph();
        }
        
        fillCityInfo(weekInfo);
        fillTodayInfo(todayInfo);
        const weekForecast = getWeekInfo(weekInfo, todayInfo);
        fillWeekInfo(weekForecast);
        searchInput.value = '';
    } else {
        if ( searchInput.classList.contains('invalid') ) {
            resetErrorParagraph();
        }
        errorHandling('wrong city name');
    }
}
// ========================================================================

// error handling ========================================================
function errorHandling(error) {
    const searchInput = document.querySelector('.search__field input');
    if ( !searchInput.classList.contains('invalid') ) {
        const errorParagraph = document.createElement('p');
        if (error == 'empty') {
            errorParagraph.textContent = 'You should enter the name of the city!';
        } else {
            errorParagraph.textContent = 'Maybe written city does not exist, he!';
        }
        errorParagraph.classList.add('error-input');
        searchInput.classList.add('invalid');
        searchInput.after(errorParagraph);
    }
}

function resetErrorParagraph() {
    const searchInput = document.querySelector('.search__field input');
    searchInput.classList.remove('invalid');

    const errorParagraph = document.querySelector('.error-input');
    errorParagraph.remove();
}
// ========================================================================

// fill infos =============================================================
function fillCityInfo(todayWeatherInfo) {
    const weekInfo = todayWeatherInfo.list;

    const todayBlock = document.querySelector('.today');
    const city = todayBlock.querySelector('.today__city');
    const sunrise = todayBlock.querySelector('.today__sunrise');
    const sunset = todayBlock.querySelector('.today__sunset');

    city.textContent = todayWeatherInfo.city.name + ', ' + todayWeatherInfo.city.country;
    sunriseDate = new Date(todayWeatherInfo.city.sunrise * 1000);
    sunsetDate = new Date(todayWeatherInfo.city.sunset * 1000);
    sunrise.textContent = 'sunrise: ' + getCorrectTime(sunriseDate);
    sunset.textContent = 'sunset: ' + getCorrectTime(sunsetDate);
}

function fillTodayInfo(todayInfo) {
    const todayBlock = document.querySelector('.today');
    const mainInfo = todayBlock.querySelector('.today__main-info');
    const date = todayBlock.querySelector('.today__date');
    const temperature = todayBlock.querySelector('.today__temperature');
    const temperatureFeels = todayBlock.querySelector('.today__temperature-feels');
    const clouds = todayBlock.querySelector('.today__clouds-percentage');
    const humidity = todayBlock.querySelector('.today__humidity');
    const pressure = todayBlock.querySelector('.today__pressure');
    const wind = todayBlock.querySelector('.today__wind');

    mainInfo.textContent = todayInfo.weather[0].description;
    const mainInfoIcon = document.createElement('img');
    const weatherIconSRC = getIconSRC(todayInfo);
    mainInfoIcon.src = `images/icons/${weatherIconSRC}`;
    mainInfo.appendChild(mainInfoIcon);

    date.textContent = getCorrectDate(todayInfo);
    temperature.textContent = Math.round(todayInfo.main.temp * 10) / 10 + String.fromCharCode(176) + 'C';
    temperatureFeels.textContent = 'feels like: ' + (Math.round(todayInfo.main.feels_like * 10) / 10) + String.fromCharCode(176) + 'C';
    clouds.textContent = 'clouds: ' + todayInfo.clouds.all + '%';
    humidity.textContent = 'humidity: ' + todayInfo.main.humidity + '%';
    pressure.textContent = 'pressure: ' + (Math.round(todayInfo.main.pressure / 0.1332) / 10) + 'mm of Hg';
    wind.textContent = 'wind: ' + todayInfo.wind.speed + 'm/s';
}

function fillWeekInfo(weekForecast) {
    const dayTemps = weekForecast.dayTemps;
    const nightTemps = weekForecast.nightTemps;
    const dayDatesAndTimes = weekForecast.dayDates;
    const icons = weekForecast.icons;

    // I know, it could be done by less number of lines, but it is more readable now
    let dayDates = [];
    for (const dayDateAndTime of dayDatesAndTimes) {
        const dayDate = dayDateAndTime.split(' | ')[0];
        dayDates.push(dayDate);
    }
    
    let days = []; // Monday, Tuesday etc.
    let dates = []; // 12 Jul '22, 13 Jul '22 etc.
    for (const currentDate of dayDates) {
        const currentDay = getFullDayName(currentDate.split(', ')[0]);
        days.push(currentDay);
        dates.push(currentDate.split(', ')[1]);
    }
    const weekSingleDayList = document.querySelectorAll('.week-single-day');
    for (let i = 0; i < weekSingleDayList.length; i++) {
        const icon = icons[i];
        icon.classList.add('icon');
        let day = days[i];
        let date = dates[i];
        let dayTemp = dayTemps[i];
        let nightTemp = nightTemps[i];
        let singleDayBlock = weekSingleDayList[i];

        const dayBlock = singleDayBlock.querySelector('.day-name__day');
        dayBlock.textContent = day;

        const dateBlock = singleDayBlock.querySelector('.day-name__date');
        dateBlock.textContent = date;

        const dayTempBlock = singleDayBlock.querySelector('.day-temp');
        dayTempBlock.textContent = dayTemp + String.fromCharCode(176) + 'C';
        
        const nightTempBlock = singleDayBlock.querySelector('.night-temp');
        if (nightTemp != undefined) {
            nightTempBlock.textContent = nightTemp + String.fromCharCode(176) + 'C';
        } else {
            nightTempBlock.textContent = 'not known yet, sorry(';
        }
        
        singleDayBlock.appendChild(icon);
    }
}
// ========================================================================

// gets ===================================================================
async function getWeekForecast(city, apiKey) {
    let weekInfo = await fetch(`https://api.openweathermap.org/data/2.5/forecast/?APPID=${apiKey}&q=${city}&units=metric&cnt=40`, {
        mode: 'cors',
    });
    if (weekInfo.ok) {
        weekInfo = await weekInfo.json();
        return weekInfo;
    } else {
        console.log('something wrong!');
    }
    
}

async function getWeatherData(city, apiKey) {
    let weatherData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}&units=metric`, {
        mode: 'cors',
    });
    if (weatherData.ok) {
        weatherData = await weatherData.json();
        return weatherData;
    } else {
        console.log('something wrong!');
    }
}

function getWeekInfo(weekInfo, todayInfo) {
    const weekInfoList = weekInfo.list;
    if (weekInfoList.length > 0) {
        let nextFourDays = {};
        let dayDates = [];
        let dayTemps = [];
        let nightTemps = [];
        let dayIconsSRC = [];
        for (let i = 0; i < weekInfoList.length; i++) {
            const dayInfo = weekInfoList[i];
            if ( new Date(dayInfo.dt * 1000).getDay() != new Date(todayInfo.dt * 1000).getDay() ) {
                if (new Date(dayInfo.dt * 1000).getHours() == 14) {
                    const currentDay = getCorrectDate(dayInfo); 
                    dayDates.push(currentDay);
                    dayTemps.push(dayInfo.main.temp);

                    const dayIcon = document.createElement('img');
                    const weatherIconSRC = getIconSRC(dayInfo);
                    dayIcon.src = `images/icons/${weatherIconSRC}`;
                    dayIconsSRC.push(dayIcon);

                } else if(new Date(dayInfo.dt * 1000).getHours() == 2) {
                    nightTemps.push(dayInfo.main.temp);
                }
            }
        }
        nightTemps.splice(0, 1); //delete tommorow day's temperature at 2:00
        nextFourDays.dayDates = dayDates;
        nextFourDays.dayTemps = dayTemps;
        nextFourDays.nightTemps = nightTemps;
        nextFourDays.icons = dayIconsSRC;
        return nextFourDays;
    }
}

function getCorrectTime(dateData) {

    let correctTime = '';
    let hours = dateData.getHours();
    if (hours < 10) {
        correctTime = '0' + hours.toString();
    } else {
        correctTime = hours.toString();
    }

    correctTime += ':';

    let minutes = dateData.getMinutes();
    if (minutes < 10) {
        correctTime += '0' + minutes.toString();
    } else {
        correctTime += minutes.toString();
    }

    return correctTime;
}

function getCorrectDate(todayInfo) {
    let week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNumber = new Date(todayInfo.dt * 1000).getDay();
    const weekDay = week[dayNumber];
    const monthNumber = new Date(todayInfo.dt * 1000).getMonth();

    const date = new Date(todayInfo.dt * 1000).getDate();
    const month = months[monthNumber];
    const fullYear = new Date(todayInfo.dt * 1000).getFullYear();
    const year = "'" + (fullYear - 2000);
    const time = getCorrectTime(new Date(todayInfo.dt * 1000));

    return `${weekDay}, ${date} ${month} ${year} | ${time}`;
}

function getIconSRC(weather) {
    if (weather) {
        const icon = weather.weather[0].icon;
        if (icon == '01d') {
            return 'clear-day.svg';
        } else if (icon == '01n') {
            return 'clear-night.svg';
        } else if (icon == '02d') {
            return 'partly-cloudy-day.svg';
        } else if (icon == '02n') {
            return 'partly-cloudy-night.svg';
        } else if (icon == '03d' || icon == '03n' || icon == '04d' || icon == '04n') {
            return 'cloudy.svg';
        } else if (icon == '50d' || icon == '50n') {
            return 'mist.svg';
        } else if (icon == '09d' || icon == '9n' || icon == '10d' || icon == '10n') {
            return 'rain.svg';
        } else if (icon == '11d' || icon == '11n') {
            return 'thunderstorm.svg';
        } else if (icon == '13d' || icon == '13n') {
            return 'snow.svg';
        }
    }
}

function getFullDayName(shortName) {
    if (shortName == 'Mon') {
        return 'Monday';
    } else if (shortName == 'Tue') {
        return 'Tuesday';
    } else if (shortName == 'Wed') {
        return 'Wednesday';
    } else if (shortName == 'Thu') {
        return 'Thursday';
    } else if (shortName == 'Fri') {
        return 'Friday';
    } else if (shortName == 'Sat') {
        return 'Saturday';
    } else if (shortName == 'Sun') {
        return 'Sunday';
    }
}
// ========================================================================

// other ===================================================================
function changeCity() {
    const searchInput = document.querySelector('.search__field input');
    if (searchInput.value.trim() != '') {
        const newCity = searchInput.value;
        main(newCity);
    } else {
        if ( searchInput.classList.contains('invalid') ) {
            resetErrorParagraph();
        }
        errorHandling('empty');
    }
}

function resetAllFields() {
    const weekBlocks = document.querySelectorAll('.week-single-day');
    for (let i = 0; i < weekBlocks.length; i++) {
        const weekBlock = weekBlocks[i];
        const image = weekBlock.querySelector('img');
        if (image) {
            image.remove();
        } 

        const dayName = weekBlock.querySelector('.day-name__day');
        dayName.textContent = '';

        const dateName = weekBlock.querySelector('.day-name__date');
        dateName.textContent = '';

        const dayTemp = weekBlock.querySelector('.day-temp');
        dayTemp.textContent = '';

        const nightTemp = weekBlock.querySelector('.night-temp');
        nightTemp.textContent = '';
    }
}

main('Sterlibashevo'); //first launch