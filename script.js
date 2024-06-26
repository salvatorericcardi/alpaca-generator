// Globals #########
const lastAlpaca = {
    accessories: null,
    backgrounds: null,
    ears: "default",
    eyes: "default",
    hair: "default",
    leg: "default",
    mouth: "default",
    neck: "default",
}

const alpaca = {
    accessories: [],
    backgrounds: [],
    ears: [],
    eyes: [],
    hair: [],
    leg: [],
    mouth: [],
    neck: []
}

const selectedEl = {}
// ##################

const isSelected = label => label.classList.contains("selected")
const isChecked = label => label.previousElementSibling.checked
const randomAlpaca = key => Math.floor(Math.random() * key.length)

const setImageToDownload = () => {
    const images = []
    const download = document.getElementById("download")

    const body = Object.entries(lastAlpaca).filter(entry => entry[1] !== null)
    for (const part of body) {
        const image = getImageWithPriority(part)
        images.push(image)
    }

    images.push({
        src: `images/nose.png`,
        priority: 3
    })

    const sorted = images.sort(compareByPriority)
    mergeImages(sorted).then(ImageData => {
        download.setAttribute("download", "alpaca.jpeg")
        download.setAttribute("href", ImageData)
    });
}

const compareByPriority = (a, b) => {
    if (a.priority > b.priority) {
        return 1;
    }
    
    if (a.priority < b.priority) {
        return -1;
    }

    return 0;
}

const getImageWithPriority = (part) => {
    const object = {
        src: `images/${part[0]}/${part[1]}.png`
    }
    
    switch (part[0]) {
        case "backgrounds":
            object.priority = 1
            break;
        case "accessories":
        case "eyes":
        case "nose":
            object.priority = 3
            break;
        case "mouth":
            object.priority = 4
            break;
        default:
            object.priority = 2
            break;
    }

    return object
}

const reset = () => {
    const inputs = document.querySelectorAll("input[type='radio']")
    for(const input of inputs) {
        if(input.checked && input.nextElementSibling.classList.contains("selected")) {
            input.checked = false
            input.nextElementSibling.classList.remove("selected")
        }
    }
}

const resetRadioButtons = inputs => {
    for(const el of inputs) {
        el.classList.remove("selected")
        el.previousElementSibling.checked = false
    }
}

/* const isScrolledToRight = (el) => {
    // IT WORKS
    // NOTE: scrollLeft is fractional, while scrollWidth and clientWidth are
    // not, so without this Math.abs() trick then sometimes the result won't
    // work because scrollLeft may not be exactly equal to el.scrollWidth -
    // el.clientWidth when scrolled to the right
    return Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft) * 0.66 < 1
} */

// every accessory has onclick event
for(const el of document.getElementsByClassName("accessory")) {
    el.addEventListener("click", (e) => {
        // toggle selected class on label click
        e.target.classList.toggle("selected")

        // if label is selected set input checked if not remove checked
        if(isSelected(e.target)) {
            e.target.previousElementSibling.setAttribute("checked", true)
            document.getElementById(`${e.target.previousElementSibling.value}-style`).style.display = "contents"
            
            selectedEl[e.target.previousElementSibling.value] = e.target.previousElementSibling.value
        } else {
            e.target.previousElementSibling.removeAttribute("checked")
            document.getElementById(`${e.target.previousElementSibling.value}-style`).style.display = "none"
            delete selectedEl[e.target.previousElementSibling.value]
        }

        sessionStorage.setItem("selectedEl", JSON.stringify(selectedEl))
    })
}

// every style has onclick event
for(const el of document.getElementsByClassName("styles")) {
    // foreach value populate alpaca obj with its group and the relative values
    alpaca[el.classList[1]].push(el.classList[1] === el.previousElementSibling.id.split("-")[1] ? el.previousElementSibling.id.split("-")[0] : el.previousElementSibling.id.split("-").slice(0, 2).join("-"))

    el.addEventListener("click", (e) => {
        if(!isChecked(e.target)) {
            // reset radio buttons in the input group
            if(sessionStorage.getItem("selectedEl")) {
                const selectedEl = JSON.parse(sessionStorage.getItem("selectedEl"))
                for(const sel of Object.keys(selectedEl)) {
                    if(sel === e.target.previousElementSibling.name) {
                        resetRadioButtons(document.getElementsByClassName(sel))
                    }
                }
            }

            e.target.classList.add("selected")
            e.target.previousElementSibling.checked = true

            // change alpaca image src here
            const last = e.target.classList[1] === e.target.previousElementSibling.id.split("-")[1] ? 
                e.target.previousElementSibling.id.split("-")[0] : 
                e.target.previousElementSibling.id.split("-").slice(0, 2).join("-")
            
            const key = e.target.classList[1]
            document.getElementById(key).src = `images/${key}/${last}.png`

            lastAlpaca[key] = last
        }

        setImageToDownload()
    })
}

// every arrow button has on click event
for(const el of document.getElementsByClassName("arrow")) {
    el.addEventListener("click", (e) => {
        e.preventDefault()
        const button = e.target
        // const arrows = document.getElementsByClassName("arrow")

        // if click on right arrow and not scrollend enter in the loop
        if(button.classList.contains("right") /* && !isScrolledToRight(parent.previousElementSibling) */) {
            // move to the right
            button.previousElementSibling.scrollLeft += button.previousElementSibling.getBoundingClientRect().width

            /* if(arrows[0].classList.contains("disabled")) {
                arrows[0].classList.remove("disabled")
                arrows[0].disabled = false
            }

            // if container position at end disable right arrow
            if(isScrolledToRight(parent.previousElementSibling)) {
                arrows[1].classList.add("disabled")
                arrows[1].disabled = true
            } */
        // if click on left arrow and not scrollstart enter in the loop
        } else if (button.classList.contains("left") /* && Math.abs(parent.nextElementSibling.scrollLeft) >= 1 */) {
            // move to the left
            button.nextElementSibling.scrollLeft -= button.nextElementSibling.getBoundingClientRect().width

            /* if(arrows[1].classList.contains("disabled")) {
                arrows[1].classList.remove("disabled")
                arrows[1].disabled = false
            }

            // if container position at start disable left arrow 
            if(!arrows[0].classList.contains("disabled") && Math.abs(parent.nextElementSibling.scrollLeft) < 1) {              
                arrows[0].classList.add("disabled")
                arrows[0].disabled = true
            } */
        }
    })
}

// random alpaca button
document.getElementById("random").addEventListener("click", () => {
    reset()

    for(const key of Object.keys(alpaca)) {
        lastAlpaca[key] = alpaca[key][randomAlpaca(alpaca[key])]
        
        document.getElementById(key).src = `images/${key}/${lastAlpaca[key]}.png`
        
        document.querySelector(`input[name='${key}']#${lastAlpaca[key]}-${key}`).checked = true
        document.querySelector(`input[name='${key}']#${lastAlpaca[key]}-${key}`).nextElementSibling.classList.add("selected")
    }

    setImageToDownload()
})

// html2canvas on dom content loaded
document.addEventListener("DOMContentLoaded", () => {
    setImageToDownload()
})