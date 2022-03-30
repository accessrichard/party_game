import { Outlet } from 'react-router';
import React from 'react';

export default function InlineFacesSprite() {
    return (<>
        <svg xmlns="http://www.w3.org/2000/svg" className="hidden">
            <defs>
                <symbol id="happy1" viewBox="0 0 58 58">
                    <path style={{ fill: "#fdc794" }} d="M29.392 54.999c11.246.156 17.52-4.381 21.008-9.189 3.603-4.966 4.764-11.283 3.647-17.323-4.043-21.845-24.655-21.66-24.655-21.66S8.781 6.642 4.738 28.488c-1.118 6.04.044 12.356 3.647 17.323 3.487 4.807 9.761 9.344 21.007 9.188z" />
                    <path style={{ fill: "#f9a671" }} d="M4.499 30.125c-.453-.429-.985-.687-1.559-.687-1.624 0-2.94 1.981-2.94 4.424 0 2.443 1.316 4.424 2.939 4.424.687 0 1.311-.37 1.811-.964a23.635 23.635 0 0 1-.251-7.197zM57.823 26.298c-.563-2.377-2.3-3.999-3.879-3.622-.491.117-.898.43-1.225.855a32.34 32.34 0 0 1 1.328 4.957c.155.837.261 1.679.328 2.522.52.284 1.072.402 1.608.274 1.579-.377 2.403-2.609 1.84-4.986z" />
                    <path style={{ fill: "#5e5f62" }} d="M13.9 16.999a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 1 1 1.414-1.414l5 5a.999.999 0 0 1-.707 1.707zM16.901 13.999a1 1 0 0 1-.896-.553l-3-6a1 1 0 0 1 1.789-.895l3 6a1 1 0 0 1-.893 1.448zM20.9 11.999a.999.999 0 0 1-.948-.684l-2-6a1 1 0 1 1 1.897-.633l2 6a1 1 0 0 1-.949 1.317zM25.899 10.999a1 1 0 0 1-.985-.836l-1-6a.999.999 0 0 1 .822-1.15.993.993 0 0 1 1.15.822l1 6a.999.999 0 0 1-.987 1.164zM29.9 10.999a1 1 0 0 1-1-1v-6a1 1 0 1 1 2 0v6a1 1 0 0 1-1 1zM33.9 10.999a1 1 0 0 1-.948-1.317l2-6a1 1 0 1 1 1.897.633l-2 6c-.14.419-.53.684-.949.684zM37.9 11.999a1 1 0 0 1-.948-1.317l2-6a1 1 0 1 1 1.897.633l-2 6c-.14.419-.53.684-.949.684zM40.899 13.999a1 1 0 0 1-.893-1.447l3-6a1 1 0 0 1 1.789.895l-3 6a1 1 0 0 1-.896.552z" />
                    <ellipse style={{ fill: "#fff" }} cx="20" cy="24.499" rx="6" ry="7.5" />
                    <ellipse style={{ fill: "#7f5b53" }} cx="20" cy="24.499" rx="3" ry="4.5" />
                    <ellipse style={{ fill: "#fff" }} cx="38" cy="24.499" rx="6" ry="7.5" />
                    <ellipse style={{ fill: "#7f5b53" }} cx="38" cy="24.499" rx="3" ry="4.5" />
                    <path style={{ fill: "#802d40" }} d="M16 38.999v.031c0 3.821 2.109 7.383 5.543 9.059 2.139 1.044 4.692 1.685 7.442 1.685 2.747 0 5.304-.64 7.449-1.682 3.45-1.676 5.566-5.257 5.555-9.093H16z" />
                    <path style={{ fill: "#e64c3c" }} d="M38.029 47.085 38 46.999c0-2.462-4.284-3.542-9.004-3.542S20 44.536 20 46.999l-.014.111a9.5 9.5 0 0 0 1.557.979c2.139 1.044 4.692 1.685 7.442 1.685 2.747 0 5.304-.64 7.449-1.682a9.549 9.549 0 0 0 1.595-1.007z" />
                </symbol>
                <symbol id="happy2" viewBox="0 0 58 58">
                    <path style={{ fill: "#fdc794" }} d="M29.392 54.999c11.246.156 17.52-4.381 21.008-9.189 3.603-4.966 4.764-11.283 3.647-17.323-4.043-21.845-24.655-21.66-24.655-21.66S8.781 6.642 4.738 28.488c-1.118 6.04.044 12.356 3.647 17.323 3.487 4.807 9.761 9.344 21.007 9.188z" />
                    <path style={{ fill: "#f9a671" }} d="M4.499 30.125c-.453-.429-.985-.687-1.559-.687-1.624 0-2.94 1.981-2.94 4.424 0 2.443 1.316 4.424 2.939 4.424.687 0 1.311-.37 1.811-.964a23.635 23.635 0 0 1-.251-7.197zM57.823 26.298c-.563-2.377-2.3-3.999-3.879-3.622-.491.117-.898.43-1.225.855a32.34 32.34 0 0 1 1.328 4.957c.155.837.261 1.679.328 2.522.52.284 1.072.402 1.608.274 1.579-.376 2.403-2.609 1.84-4.986z" />
                    <path style={{ fill: "#5e5f62" }} d="M13.9 16.998a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 1 1 1.414-1.414l5 5a.999.999 0 0 1-.707 1.707zM16.901 13.998a1 1 0 0 1-.896-.553l-3-6a1 1 0 0 1 1.789-.895l3 6a1 1 0 0 1-.893 1.448zM20.9 11.998a.999.999 0 0 1-.948-.684l-2-6a1 1 0 1 1 1.897-.633l2 6a1 1 0 0 1-.949 1.317zM25.899 10.998a1 1 0 0 1-.985-.836l-1-6a.999.999 0 0 1 .822-1.15.994.994 0 0 1 1.15.822l1 6a.999.999 0 0 1-.987 1.164zM29.9 10.998a1 1 0 0 1-1-1v-6a1 1 0 1 1 2 0v6a1 1 0 0 1-1 1zM33.9 10.998a1 1 0 0 1-.948-1.317l2-6a1 1 0 1 1 1.897.633l-2 6a1 1 0 0 1-.949.684zM37.9 11.998a1 1 0 0 1-.948-1.317l2-6a1 1 0 1 1 1.897.633l-2 6a1 1 0 0 1-.949.684zM40.899 13.998a1 1 0 0 1-.893-1.447l3-6a1 1 0 0 1 1.789.895l-3 6a1 1 0 0 1-.896.552z" />
                    <circle style={{ fill: "#fff" }} cx="22" cy="26.003" r="6" />
                    <circle style={{ fill: "#fff" }} cx="36" cy="26.003" r="8" />
                    <circle style={{ fill: "#7f5b53" }} cx="22" cy="26.003" r="2" />
                    <circle style={{ fill: "#7f5b53" }} cx="36" cy="26.003" r="3" />
                    <path style={{ fill: "#f9a671" }} d="M28.229 50.009c-3.336 0-6.646-.804-9.691-2.392a1 1 0 1 1 .924-1.774 18.879 18.879 0 0 0 14.487 1.28 18.876 18.876 0 0 0 11.144-9.346 1 1 0 1 1 1.774.924A20.863 20.863 0 0 1 34.551 49.03a21 21 0 0 1-6.322.979z" />
                    <path style={{ fill: "#f9a671" }} d="M18 50.003a1 1 0 0 1-1-1c0-2.757 2.243-5 5-5a1 1 0 1 1 0 2c-1.654 0-3 1.346-3 3a1 1 0 0 1-1 1zM48 42.003a1 1 0 0 1-1-1c0-1.654-1.346-3-3-3a1 1 0 1 1 0-2c2.757 0 5 2.243 5 5a1 1 0 0 1-1 1z" />
                </symbol>
                <symbol id="happy3" viewBox="0 0 58 58">
                    <path style={{ fill: "#6e5847" }} d="M29 0C14.975 0 3.5 11.475 3.5 25.5V50c0 2.2 1.8 4 4 4h6.777c4.16 2.021 9.237 3 14.723 3 3.564 0 6.949-.421 10.028-1.264l-4.419-4.419a11.752 11.752 0 0 0 3.891-2.573c1.065-1.066 2.039-2.223 2.632-3.631l5.357 5.357a4 4 0 0 1 1.1 3.531H50.5c2.2 0 4-1.8 4-4V25.5C54.5 11.475 43.025 0 29 0z" />
                    <path style={{ fill: "#fdc794" }} d="M29.5 11h-1c-11.24.55-21.093 8.401-24.074 18.901l-.057-.007a25.477 25.477 0 0 0-.708 3.863c-.02.179-.037.359-.054.539-.021.245-.044.49-.058.738-.03.484-.049.973-.049 1.466C3.5 50.583 14.917 57 29 57c3.564 0 6.956-.413 10.037-1.255l-4.428-4.428a11.752 11.752 0 0 0 3.891-2.573c1.065-1.066 2.039-2.223 2.632-3.631l5.357 5.357c.386.386.674.833.869 1.31 4.419-3.367 7.142-8.409 7.142-15.28 0-13.658-11.505-24.839-25-25.5z" />
                    <path style={{ fill: "#fb7b76" }} d="M38.5 48.744a11.737 11.737 0 0 1-3.891 2.573l5.516 5.516a4.011 4.011 0 0 0 5.657 0l.707-.707a4.011 4.011 0 0 0 0-5.657l-5.357-5.357c-.593 1.41-1.567 2.567-2.632 3.632z" />
                    <path style={{ fill: "#e64c3c" }} d="M42.954 53.591a.997.997 0 0 1-.707-.293l-.111-.111c-1.813-1.814-2.986-2.885-3.491-3.188a.938.938 0 0 1-.743-.292 1.001 1.001 0 0 1 .001-1.415c.951-.95 2.059-.112 5.648 3.481l.11.11a.999.999 0 0 1-.707 1.708zm-3.642-3.88zm.003-.003-.002.001.002-.001z" />
                    <path style={{ fill: "#f9a671" }} d="M30.609 53c-6.617 0-12-5.383-12-12a1 1 0 1 1 2 0c0 5.514 4.486 10 10 10s10-4.486 10-10a1 1 0 1 1 2 0c0 6.617-5.383 12-12 12z" />
                    <path style={{ fill: "#fff" }} d="M36.109 20c-1.791 0-3.451.489-4.821 1.324a4.172 4.172 0 0 1-4.358 0C25.56 20.489 23.9 20 22.109 20c-4.694 0-8.5 3.358-8.5 7.5s3.806 7.5 8.5 7.5c1.791 0 3.451-.489 4.821-1.324a4.172 4.172 0 0 1 4.358 0c1.37.835 3.03 1.324 4.821 1.324 4.694 0 8.5-3.358 8.5-7.5s-3.806-7.5-8.5-7.5z" />
                    <circle style={{ fill: "#6e5847" }} cx="23.609" cy="29" r="2" />
                    <circle style={{ fill: "#6e5847" }} cx="35.609" cy="28" r="3" />
                </symbol>
                <symbol id="happy3" viewBox="0 0 58 58">
                    <path style={{ fill: "#fbd971" }} d="M29.516 38.834 24 33.317a11.94 11.94 0 0 0 1.339-.656l4.494-4.494c.211-.378.521-.744.69-1.146l5.357 5.449a3.968 3.968 0 0 1 1.097 2.093C40.091 30.901 42 26.184 42 21 42 9.402 32.598 0 21 0S0 9.402 0 21s9.402 21 21 21c3.495 0 6.786-.861 9.685-2.372a3.932 3.932 0 0 1-1.169-.794z" />
                    <circle style={{ fill: "#fff" }} cx="12" cy="15" r="6" />
                    <circle style={{ fill: "#fff" }} cx="30" cy="15" r="6" />
                    <path style={{ fill: "#fb7b76" }} d="M27.891 30.744A11.737 11.737 0 0 1 24 33.317l5.516 5.516a4.011 4.011 0 0 0 5.657 0l.707-.707a4.011 4.011 0 0 0 0-5.657l-5.357-5.357c-.593 1.41-1.567 2.567-2.632 3.632z" />
                    <circle style={{ fill: "#af8066" }} cx="12" cy="15" r="3" />
                    <circle style={{ fill: "#af8066" }} cx="30" cy="15" r="3" />
                    <path style={{ fill: "#e64c3c" }} d="M30.179 31.438c-.669-.505-1.277-.932-1.822-1.185-.155.164-.306.331-.466.491-.371.371-.775.706-1.194 1.024.221.216.518.305.801.282.737.341 2.994 2.102 4.139 3.247a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414c-.665-.665-1.846-1.671-2.872-2.445z" />
                    <path style={{ fill: "#f0c419" }} d="M18.387 34.993c-1.981 0-3.953-.38-5.771-1.138a1 1 0 1 1 .77-1.846c3.052 1.271 6.606 1.313 9.753.116 3.217-1.224 5.682-3.561 6.939-6.578a1 1 0 0 1 1.846.77c-1.47 3.529-4.338 6.257-8.073 7.678a15.4 15.4 0 0 1-5.464.998z" />
                </symbol>
                <symbol id="sad1" viewBox="0 0 295.996 295.996">
                    <path style={{ fill: "#ffce00" }} d="M270.996 123.998a140.21 140.21 0 0 0-3.907-32.9c-7.269-15.152-17.35-28.708-29.558-39.996-22.391-13.376-48.766-20.666-76.771-19.645C83.492 34.273 23.139 99.196 25.955 176.463a140.168 140.168 0 0 0 5.087 32.673 132.688 132.688 0 0 0 23.934 32.42c21.892 14.189 47.99 22.44 76.022 22.44 77.318 0 139.998-62.68 139.998-139.998zm-73.499-25c8.836 0 16 7.164 16 16s-7.164 16-16 16-16-7.164-16-16 7.164-16 16-16zm-99 0c8.836 0 16 7.164 16 16s-7.164 16-16 16-16-7.164-16-16 7.164-16 16-16zm.001 148.9c-22.475 0-40.76-18.285-40.76-40.76 0-9.527 5.948-21.439 18.185-36.416 8.415-10.301 16.723-18.2 17.072-18.532l5.503-5.216 5.504 5.217c.349.331 8.655 8.231 17.07 18.531 4.315 5.282 7.832 10.175 10.598 14.724 11.514-2.112 23.482-2.061 35.242.397 21.262 4.447 40.354 16.391 53.756 33.631l-12.631 9.82c-11.078-14.249-26.847-24.118-44.4-27.789-8.404-1.758-16.936-2.017-25.244-.928.565 2.302.863 4.491.863 6.561 0 22.475-18.284 40.76-40.758 40.76z" />
                    <path style={{ fill: "#ffb100" }} d="M267.089 91.098a140.216 140.216 0 0 1 3.907 32.9c0 77.318-62.68 139.998-139.998 139.998-28.032 0-54.131-8.251-76.022-22.44 23.88 23.744 56.767 38.44 93.022 38.44 72.784 0 131.998-59.214 131.998-131.998 0-20.362-4.638-39.661-12.907-56.9z" />
                    <path style={{ fill: "#ffe454" }} d="M160.76 31.457c28.006-1.021 54.381 6.269 76.771 19.645C213.985 29.328 182.521 16 147.998 16 75.214 16 16 75.214 16 147.998c0 22.049 5.442 42.849 15.042 61.138a140.168 140.168 0 0 1-5.087-32.673C23.139 99.196 83.492 34.273 160.76 31.457z" />
                    <path d="M147.998 0C66.392 0 0 66.392 0 147.998s66.392 147.998 147.998 147.998 147.998-66.392 147.998-147.998S229.605 0 147.998 0zm0 279.996c-36.256 0-69.143-14.696-93.022-38.44a132.713 132.713 0 0 1-23.934-32.42C21.442 190.847 16 170.047 16 147.998 16 75.214 75.214 16 147.998 16c34.523 0 65.987 13.328 89.533 35.102 12.208 11.288 22.289 24.844 29.558 39.996 8.27 17.239 12.907 36.538 12.907 56.9 0 72.784-59.214 131.998-131.998 131.998z" />
                    <circle cx="98.497" cy="114.998" r="16" />
                    <circle cx="197.497" cy="114.998" r="16" />
                    <path style={{ fill: "#28e0ff" }} d="M98.501 169.292c-11.662 12.173-24.763 29.174-24.763 37.847 0 13.652 11.107 24.76 24.76 24.76 13.651 0 24.758-11.107 24.758-24.76 0-8.694-13.096-25.686-24.755-37.847z" />
                    <path d="M138.393 200.578c8.309-1.089 16.84-.83 25.244.928 17.554 3.671 33.322 13.54 44.4 27.789l12.631-9.82c-13.402-17.24-32.494-29.184-53.756-33.631-11.76-2.458-23.729-2.51-35.242-.397-2.766-4.549-6.282-9.441-10.598-14.724-8.415-10.3-16.722-18.2-17.07-18.531l-5.504-5.217-5.503 5.216c-.35.332-8.657 8.231-17.072 18.532-12.236 14.977-18.185 26.889-18.185 36.416 0 22.475 18.285 40.76 40.76 40.76 22.474 0 40.758-18.285 40.758-40.76 0-2.07-.299-4.259-.863-6.561zm-39.895 31.32c-13.652 0-24.76-11.107-24.76-24.76 0-8.673 13.101-25.674 24.763-37.847 11.659 12.161 24.755 29.153 24.755 37.847 0 13.653-11.107 24.76-24.758 24.76z" />
                </symbol>
                <symbol id="sad2" viewBox="0 0 57 57">
                    <path style={{ fill: "#6e5847" }} d="M28.5 0C14.475 0 3 11.475 3 25.5V50c0 2.2 1.8 4 4 4h6.777c4.16 2.021 9.237 3 14.723 3s10.563-.979 14.723-3H50c2.2 0 4-1.8 4-4V25.5C54 11.475 42.525 0 28.5 0z" />
                    <path style={{ fill: "#fdc794" }} d="M3.869 29.894A25.515 25.515 0 0 0 3 36.5C3 50.583 14.417 57 28.5 57S54 50.583 54 36.5C54 22.842 42.495 11.661 29 11h-1c-13.495.661-25 11.842-25 25.5C3 50.583 14.417 57 28.5 57S54 50.583 54 36.5" />
                    <path style={{ fill: "#0096e6" }} d="M13.083 35.824A2.055 2.055 0 0 1 11 33.808c-.019-1.127 1.967-4.148 1.982-4.132 0 0 2.098 2.938 2.117 4.065a2.057 2.057 0 0 1-2.016 2.083zM44.083 35.824A2.055 2.055 0 0 1 42 33.808c-.019-1.127 1.967-4.148 1.982-4.132 0 0 2.098 2.938 2.117 4.065a2.057 2.057 0 0 1-2.016 2.083zM48.083 43.824A2.055 2.055 0 0 1 46 41.808c-.019-1.127 1.967-4.148 1.982-4.132 0 0 2.098 2.938 2.117 4.065a2.057 2.057 0 0 1-2.016 2.083zM8.984 43.824a2.055 2.055 0 0 1-2.083-2.016c-.019-1.127 1.967-4.148 1.982-4.132 0 0 2.098 2.938 2.117 4.065a2.057 2.057 0 0 1-2.016 2.083z" />
                    <path style={{ fill: "#f9a671" }} d="M22.485 26.676a.997.997 0 0 1-.707-.293 4.97 4.97 0 0 0-3.535-1.467 4.966 4.966 0 0 0-3.536 1.467.999.999 0 1 1-1.414-1.414 6.955 6.955 0 0 1 4.95-2.053 6.95 6.95 0 0 1 4.949 2.053.999.999 0 0 1-.707 1.707zM43 26.676a.997.997 0 0 1-.707-.293 4.97 4.97 0 0 0-3.536-1.467c-1.334 0-2.59.521-3.535 1.467a.999.999 0 1 1-1.414-1.414 6.954 6.954 0 0 1 4.949-2.053 6.95 6.95 0 0 1 4.95 2.053.999.999 0 0 1-.707 1.707z" />
                    <path style={{ fill: "#802d40" }} d="M18 48.676c0-6.075 4.925-9 11-9s11 2.925 11 9-4.925 1-11 1-11 5.075-11-1z" />
                    <path style={{ fill: "#e64c3c" }} d="M29 49.683c1.798 0 3.494.445 4.993.913-.04-2.727-2.256-4.927-4.993-4.927s-4.953 2.2-4.993 4.927c1.499-.469 3.195-.913 4.993-.913z" />
                </symbol>
                <symbol id="sad3" viewBox="0 0 387.04 387.04">
                    <path style={{ fill: "#f9c5ee" }} d="M349.71 198.44c12.29 3.5 21.33 14.81 21.33 28.21 0 13.39-9.04 24.71-21.33 28.2v-56.41zM37.32 198.44v56.41C25.03 251.36 16 240.04 16 226.65c0-13.4 9.03-24.71 21.32-28.21z" />
                    <path style={{ fill: "#fcd9eb" }} d="M333.71 175.33v83.43c0 35.13-12.86 59.43-39.32 74.29-22.6 12.69-55.6 18.86-100.87 18.86-22.64 0-42.21-1.54-58.94-4.67-16.74-3.13-30.64-7.85-41.94-14.19-26.46-14.86-39.32-39.16-39.32-74.29v-83.43c0-63.31 42.19-116.94 99.92-134.29 43.98.56 67.41 32.31 67.41 55.3 0 17.6-14.33 31.93-31.94 31.93-13.2 0-23.94-10.74-23.94-23.95 0-9.68 7.87-17.56 17.55-17.56 4.42 0 8-3.58 8-8 0-4.41-3.58-8-8-8-18.5 0-33.55 15.06-33.55 33.56 0 22.03 17.92 39.95 39.94 39.95 26.43 0 47.94-21.5 47.94-47.93 0-16.61-8.35-34.47-22.32-47.79-5.59-5.33-11.95-9.81-18.88-13.39 76.41 1.04 138.26 63.51 138.26 140.17zm-25.97 24.78c0-4.42-3.58-8-8-8-8.39 0-15.22-6.83-15.22-15.22 0-4.42-3.58-8-8-8s-8 3.58-8 8c0 17.21 14.01 31.22 31.22 31.22 4.42 0 8-3.59 8-8zm-18.14 33.06c0-8.49-6.89-15.37-15.37-15.37-8.49 0-15.37 6.88-15.37 15.37s6.88 15.37 15.37 15.37c8.48 0 15.37-6.88 15.37-15.37zm-53.83 72.28a7.985 7.985 0 0 0 0-11.31c-23.3-23.3-61.21-23.3-84.51 0-3.12 3.12-3.12 8.19 0 11.31a7.997 7.997 0 0 0 11.32 0c17.06-17.06 44.82-17.06 61.88 0a7.974 7.974 0 0 0 5.65 2.34c2.05 0 4.1-.78 5.66-2.34zm-107.6-72.28c0-8.49-6.88-15.37-15.36-15.37-8.49 0-15.37 6.88-15.37 15.37s6.88 15.37 15.37 15.37c8.48 0 15.36-6.88 15.36-15.37zm-9.66-56.28c0-4.42-3.58-8-8-8s-8 3.58-8 8c0 8.39-6.83 15.22-15.22 15.22-4.42 0-8 3.58-8 8 0 4.41 3.58 8 8 8 17.22 0 31.22-14.01 31.22-31.22z" />
                    <path style={{ fill: "#333" }} d="M349.71 182.05c21.19 3.79 37.33 22.34 37.33 44.6 0 22.45-16.42 41.13-37.87 44.7-3.02 34.41-18.77 59.83-46.95 75.65-25.05 14.07-60.61 20.91-108.7 20.91S109.87 361.07 84.81 347c-28.18-15.82-43.92-41.24-46.94-75.65C16.41 267.78 0 249.1 0 226.65c0-22.26 16.13-40.81 37.32-44.6v-6.72c0-86.13 70.07-156.2 156.2-156.2 86.12 0 156.19 70.07 156.19 156.2v6.72zm21.33 44.6c0-13.4-9.04-24.71-21.33-28.21v56.41c12.29-3.49 21.33-14.81 21.33-28.2zm-37.33 32.11v-83.43c0-76.66-61.85-139.13-138.26-140.17 6.93 3.58 13.29 8.06 18.88 13.39 13.97 13.32 22.32 31.18 22.32 47.79 0 26.43-21.51 47.93-47.94 47.93-22.02 0-39.94-17.92-39.94-39.95 0-18.5 15.05-33.56 33.55-33.56 4.42 0 8 3.59 8 8 0 4.42-3.58 8-8 8-9.68 0-17.55 7.88-17.55 17.56 0 13.21 10.74 23.95 23.94 23.95 17.61 0 31.94-14.33 31.94-31.93 0-22.99-23.43-54.74-67.41-55.3-57.73 17.35-99.92 70.98-99.92 134.29v83.43c0 35.13 12.86 59.43 39.32 74.29 11.3 6.34 25.2 11.06 41.94 14.19 16.73 3.13 36.3 4.67 58.94 4.67 45.27 0 78.27-6.17 100.87-18.86 26.46-14.86 39.32-39.16 39.32-74.29zm-296.39-3.91v-56.41C25.03 201.94 16 213.25 16 226.65c0 13.39 9.03 24.71 21.32 28.2z" />
                    <path style={{ fill: "#ce91c3" }} d="M299.74 192.11c4.42 0 8 3.58 8 8 0 4.41-3.58 8-8 8-17.21 0-31.22-14.01-31.22-31.22 0-4.42 3.58-8 8-8s8 3.58 8 8c0 8.39 6.83 15.22 15.22 15.22z" />
                    <path style={{ fill: "#0677cc" }} d="M274.23 217.8c8.48 0 15.37 6.88 15.37 15.37s-6.89 15.37-15.37 15.37c-8.49 0-15.37-6.88-15.37-15.37s6.88-15.37 15.37-15.37z" />
                    <path style={{ fill: "#333" }} d="M235.77 294.14a7.985 7.985 0 0 1 0 11.31 7.98 7.98 0 0 1-5.66 2.34c-2.04 0-4.09-.78-5.65-2.34-17.06-17.06-44.82-17.06-61.88 0a7.997 7.997 0 0 1-11.32 0c-3.12-3.12-3.12-8.19 0-11.31 23.3-23.3 61.21-23.3 84.51 0z" />
                    <path style={{ fill: "#0677cc" }} d="M112.81 217.8c8.48 0 15.36 6.88 15.36 15.37s-6.88 15.37-15.36 15.37c-8.49 0-15.37-6.88-15.37-15.37s6.88-15.37 15.37-15.37z" />
                    <path style={{ fill: "#ce91c3" }} d="M110.51 168.89c4.42 0 8 3.58 8 8 0 17.21-14 31.22-31.22 31.22-4.42 0-8-3.59-8-8 0-4.42 3.58-8 8-8 8.39 0 15.22-6.83 15.22-15.22 0-4.42 3.58-8 8-8z" />
                </symbol>
                <symbol id="sad4" viewBox="0 0 512.003 512.003">
                    <circle style={{ fill: "#fddf6d" }} cx="256.001" cy="256.001" r="256.001" />
                    <path style={{ fill: "#fcc56b" }} d="M310.859 474.208c-141.385 0-256-114.615-256-256 0-75.537 32.722-143.422 84.757-190.281C56.738 70.303 0 156.525 0 256c0 141.385 114.615 256 256 256 65.849 0 125.883-24.87 171.243-65.718-34.918 17.853-74.473 27.926-116.384 27.926z" />
                    <circle style={{ fill: "#7f184c" }} cx="219.398" cy="211.927" r="31.243" />
                    <circle style={{ fill: "#7f184c" }} cx="395.305" cy="211.927" r="31.243" />
                    <path style={{ fill: "#7f184c" }} d="M369.694 430.737a10.406 10.406 0 0 1-9.108-5.349c-9.763-17.527-28.276-28.415-48.313-28.415-19.528 0-38.25 10.998-48.865 28.702-2.958 4.932-9.355 6.533-14.287 3.577-4.934-2.958-6.535-9.354-3.577-14.287 14.357-23.945 39.926-38.821 66.73-38.821 27.589 0 53.073 14.986 66.511 39.108 2.799 5.024.994 11.367-4.03 14.165a10.359 10.359 0 0 1-5.061 1.32z" />
                    <path style={{ fill: "#3fa9f5" }} d="M249.003 345.027c0 17.825-14.45 32.275-32.275 32.275s-32.275-14.45-32.275-32.275 32.275-64.31 32.275-64.31 32.275 46.486 32.275 64.31z" />
                    <ellipse transform="rotate(-74.199 309.273 71.2)" style={{ fill: "#fceb88" }} cx="309.272" cy="71.196" rx="29.854" ry="53.46" />
                </symbol>
                <symbol id="sad5" viewBox="0 0 512.003 512.003">
                    <circle style={{ fill: "#fddf6d" }} cx="256.001" cy="256.001" r="256.001" />
                    <path style={{ fill: "#fcc56b" }} d="M310.859 474.208c-141.385 0-256-114.615-256-256 0-75.537 32.722-143.422 84.757-190.281C56.738 70.303 0 156.525 0 256c0 141.385 114.615 256 256 256 65.849 0 125.883-24.87 171.243-65.718-34.918 17.853-74.473 27.926-116.384 27.926z" />
                    <path style={{ fill: "#3fa9f5" }} d="M214.76 207.477c-25.664 1.047-39.146 21.868-40.262 23.658v267.611C200.099 507.338 227.505 512 256 512c1.037 0 2.069-.028 3.105-.039V231.134c-9.579-15.312-26.532-24.385-44.345-23.657zM392.434 207.477c-25.664 1.047-39.146 21.868-40.262 23.658v262.168c31.909-12.944 60.621-32.124 84.606-56.046V231.135c-9.578-15.313-26.531-24.386-44.344-23.658z" />
                    <path style={{ fill: "#7f184c" }} d="M450.563 250.716a10.408 10.408 0 0 1-9.108-5.349c-9.456-16.976-27.387-27.519-46.793-27.519-18.913 0-37.051 10.655-47.333 27.807-2.956 4.932-9.355 6.533-14.287 3.577-4.934-2.958-6.535-9.354-3.577-14.287 14.026-23.394 39.008-37.927 65.199-37.927 26.957 0 51.858 14.643 64.989 38.214 2.799 5.024.996 11.367-4.03 14.165a10.36 10.36 0 0 1-5.06 1.319zM269.71 250.716a10.406 10.406 0 0 1-9.108-5.349c-9.455-16.976-27.386-27.519-46.793-27.519-18.913 0-37.05 10.655-47.333 27.807-2.958 4.932-9.355 6.533-14.287 3.577-4.934-2.958-6.535-9.354-3.577-14.287 14.026-23.394 39.008-37.927 65.199-37.927 26.957 0 51.86 14.643 64.989 38.214 2.799 5.024.994 11.367-4.03 14.165a10.36 10.36 0 0 1-5.06 1.319z" />
                    <circle style={{ fill: "#7f184c" }} cx="305.644" cy="375.962" r="46.533" />
                    <ellipse transform="rotate(-74.199 302.413 73.56)" style={{ fill: "#fceb88" }} cx="302.412" cy="73.556" rx="29.854" ry="53.46" />
                </symbol>
                <symbol id="sad6" viewBox="0 0 295.996 295.996">
                    <path style={{ fill: "#ffce00" }} d="M270.996 123.998a140.21 140.21 0 0 0-3.907-32.9c-7.269-15.152-17.35-28.708-29.558-39.996-22.391-13.376-48.766-20.666-76.772-19.645-37.566 1.369-71.131 17.422-95.386 42.433l45.716-19.798 6.359 14.682-50.671 21.944-5.418-12.51c-23.196 26.016-36.774 60.674-35.404 98.255a140.221 140.221 0 0 0 5.087 32.673 132.688 132.688 0 0 0 23.934 32.42c21.892 14.189 47.99 22.44 76.023 22.44 77.317 0 139.997-62.68 139.997-139.998zm-86.092-69.906 50.672 21.944-6.359 14.682-50.672-21.944 6.359-14.682zm28.593 61.906c0 8.836-7.164 16-16 16s-16-7.164-16-16 7.164-16 16-16 16 7.164 16 16zm-115-16c8.836 0 16 7.164 16 16s-7.164 16-16 16-16-7.164-16-16 7.164-16 16-16zm-20.113 109.51-14.648-6.438c13.872-31.566 45.052-53.112 79.435-54.892 34.606-1.798 67.991 16.555 85.014 46.744a92.249 92.249 0 0 1 4.075 8.148l-14.648 6.436a76.092 76.092 0 0 0-3.363-6.724c-14.066-24.946-41.666-40.108-70.25-38.626-28.4 1.471-54.154 19.272-65.615 45.352z" />
                    <path style={{ fill: "#ffb100" }} d="M267.089 91.098a140.216 140.216 0 0 1 3.907 32.9c0 77.318-62.68 139.998-139.998 139.998-28.032 0-54.131-8.251-76.023-22.44 23.88 23.744 56.766 38.44 93.023 38.44 72.784 0 131.998-59.214 131.998-131.998 0-20.362-4.638-39.661-12.907-56.9z" />
                    <path style={{ fill: "#ffe454" }} d="m61.359 78.208-.941-2.172 4.956-2.146c24.255-25.011 57.819-41.063 95.386-42.433 28.006-1.021 54.381 6.268 76.772 19.645C213.985 29.328 182.521 16 147.998 16 75.214 16 16 75.214 16 147.998c0 22.049 5.442 42.849 15.042 61.138a140.221 140.221 0 0 1-5.087-32.673c-1.37-37.581 12.208-72.239 35.404-98.255z" />
                    <path d="M147.998 0C66.392 0 0 66.392 0 147.998s66.392 147.998 147.998 147.998 147.998-66.392 147.998-147.998S229.605 0 147.998 0zm0 279.996c-36.257 0-69.143-14.696-93.023-38.44a132.713 132.713 0 0 1-23.934-32.42C21.442 190.847 16 170.047 16 147.998 16 75.214 75.214 16 147.998 16c34.523 0 65.987 13.328 89.533 35.102 12.208 11.288 22.289 24.844 29.558 39.996 8.27 17.239 12.907 36.538 12.907 56.9 0 72.784-59.214 131.998-131.998 131.998zm-55.866-3.602c.24.105.48.212.722.316l-.722-.316z" />
                    <circle cx="98.497" cy="115.998" r="16" />
                    <circle cx="197.497" cy="115.998" r="16" />
                    <path transform="scale(-1) rotate(23.417 349.37 -999.121)" d="M179.443 64.402h55.218v15.999h-55.218z" />
                    <path d="m61.359 78.208 5.418 12.51 50.672-21.944-6.359-14.682L65.374 73.89l-4.956 2.146zM214.247 202.783a75.818 75.818 0 0 1 3.363 6.724l14.648-6.436a92.112 92.112 0 0 0-4.075-8.148c-17.022-30.189-50.407-48.542-85.014-46.744-34.383 1.779-65.563 23.325-79.435 54.892l14.648 6.438c11.461-26.08 37.215-43.881 65.613-45.351 28.586-1.483 56.186 13.679 70.252 38.625z" />
                </symbol>
                <symbol id="sad7" viewBox="0 0 47 47">
                    <path style={{ fill: "#ffd581" }} d="M44 19.662c-1.74-9.843-10.158-17-20.5-17S4.74 9.819 3 19.662c-1.663.661-3 2.602-3 4.5 0 1.978 1.284 3.639 3.058 4.242C5.21 37.715 13.536 44.662 23.5 44.662c9.965 0 18.29-6.948 20.442-16.258v.001C45.716 27.801 47 26.14 47 24.162c0-1.898-1.337-3.839-3-4.5z" />
                    <path style={{ fill: "#cb8252" }} d="M31 39.663a1 1 0 0 1-1-1c0-3.309-2.691-6-6-6s-6 2.691-6 6a1 1 0 1 1-2 0c0-4.411 3.589-8 8-8s8 3.589 8 8a1 1 0 0 1-1 1z" />
                    <circle style={{ fill: "#414141" }} cx="17" cy="25.662" r="2" />
                    <circle style={{ fill: "#414141" }} cx="31" cy="25.662" r="2" />
                    <path style={{ fill: "#414141" }} d="M44 19.662v.001C42.26 9.821 33.684 2.338 23.342 2.338S4.74 9.819 3 19.662c0 0 16.906 4.33 28.242-4.726.555-.444 1.362-.34 1.758.25 2.049 3.052 5.828 6.756 11 4.476z" />
                </symbol>
            </defs>
        </svg>
        <Outlet />
    </>
    );
}