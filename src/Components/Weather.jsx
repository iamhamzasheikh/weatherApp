import './Weather.css';
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import humidity_icon from '../assets/humidity.png';
import rain_icon from '../assets/rain.png';
import snow_icon from '../assets/snow.png';
import wind_icon from '../assets/wind.png';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { Geolocation } from '@capacitor/geolocation';


const Weather = () => {
    const inputRef = useRef();
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [defaultLocationLoaded, setDefaultLocationLoaded] = useState(false);

    const all_icons = {
        "01d": clear_icon,
        "01n": clear_icon,
        "02d": cloud_icon,
        "02n": cloud_icon,
        "03d": cloud_icon,
        "03n": cloud_icon,
        "04d": drizzle_icon,
        "04n": drizzle_icon,
        "09d": rain_icon,
        "09n": rain_icon,
        "10d": rain_icon,
        "10n": rain_icon,
        "13d": snow_icon,
        "13n": snow_icon,
    };

    const search = async (city = null, lat = null, lon = null) => {
        setLoading(true);
        setError('');
        try {
            let url;
            if (city) {
                url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            } else if (lat && lon) {
                url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            } else {
                toast.error('Location not provided.');
                setLoading(false);
                return;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod === 200) {
                const icon = all_icons[data.weather[0].icon] || clear_icon;
                setWeatherData({
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    temperature: Math.round(data.main.temp),
                    location: data.name,
                    icon: icon,
                });
                if (city === 'New York') {
                    setDefaultLocationLoaded(true);
                }
            } else {
                toast.error(data.message || 'City not found.');
                setError(data.message || 'City not found.');
            }
        } catch {
            const errorMessage = 'Failed to fetch weather data. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getLocationAndFetchWeather = async () => {
        // First, try to get user's location
        if (!defaultLocationLoaded) {
            try {
                const position = await Geolocation.getCurrentPosition();
                const { latitude, longitude } = position.coords;
                await search(null, latitude, longitude);
            } catch (error) {
                console.warn('Location access denied or error occurred.');
                await search('New York'); // Fallback to New York
            }
        } else {
            // If geolocation is not supported, use New York as fallback
            if (!defaultLocationLoaded) {
                await search('New York');
            }
        }
    };

    useEffect(() => {
        getLocationAndFetchWeather();
    }, []);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            search(inputRef.current.value);
        }
    };

    return (
        <div className="weather">
            <div className="search-bar">
                <input ref={inputRef} type="text" placeholder="Search city" onKeyDown={handleSearchKeyDown} />
                <img
                    src={search_icon}
                    alt="Search"
                    onClick={() => search(inputRef.current.value)}
                />
            </div>

            {loading ? (
                <div className="spinner"></div>
            ) : (
                <>
                    {error && <p className="error-message">{error}</p>}

                    {weatherData && (
                        <>
                            <img
                                src={weatherData.icon}
                                className="weather_icon"
                                alt="Weather Icon"
                            />
                            <p className="temperature">{weatherData.temperature}°C</p>
                            <p className="location">{weatherData.location}</p>

                            <div className="weather-data">
                                <div className="col">
                                    <img src={humidity_icon} alt="Humidity Icon" />
                                    <div>
                                        <p>{weatherData.humidity}%</p>
                                        <span>Humidity</span>
                                    </div>
                                </div>

                                <div className="col">
                                    <img src={wind_icon} alt="Wind Icon" />
                                    <div>
                                        <p>{weatherData.windSpeed} km/h</p>
                                        <span>Wind Speed</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Weather;