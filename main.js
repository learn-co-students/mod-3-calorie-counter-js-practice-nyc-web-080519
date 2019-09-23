// your code here, it may be worth it to ensure this file only runs AFTER the dom has loaded.
document.addEventListener("DOMContentLoaded", function() {
    const caloriesList = document.querySelector("#calories-list")
    const progressBar = document.querySelector(".uk-progress")
    const addForm = document.querySelector("#new-calorie-form")
    const bmrForm = document.querySelector("#bmr-calulator")
    const editForm = document.querySelector("#edit-calorie-form")
    let sum = 0

    fetch("http://localhost:3000/api/v1/calorie_entries")
    .then(function(response) {
        return response.json()
    })
    .then(function(data) {
        data.forEach(function(cal) {
            caloriesList.insertAdjacentHTML("beforeend",
            `<li class="calories-list-item" data-id="${cal.id}">
                <div class="uk-grid">
                    <div class="uk-width-1-6">
                        <strong>${cal.calorie}</strong><span>kcal</span>
                    </div>
                    <div class="uk-width-4-5">
                        <em class="uk-text-meta">${cal.note}</em>
                    </div>
                </div>
                <div class="list-item-menu">
                    <a data-id="${cal.id}" class="edit-button" uk-toggle="target: #edit-form-container" uk-icon="icon: pencil"></a>
                    <a data-id="${cal.id}" class="delete-button" uk-icon="icon: trash"></a>
                </div>
            </li>`)
            sum += cal.calorie
        })
        progressBar.value = sum
    })

    addForm.addEventListener("submit", function(e) {
        e.preventDefault()
        fetch("http://localhost:3000/api/v1/calorie_entries", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                api_v1_calorie_entry: {
                    calorie: e.target.calorie.value,
                    note: e.target.note.value
                }
            })
        })
        .then(function(response) {
            return response.json()
        })
        .then(function(cal) {
            caloriesList.insertAdjacentHTML("afterbegin",
            `<li class="calories-list-item" data-id="${cal.id}">
                <div class="uk-grid">
                    <div class="uk-width-1-6">
                        <strong>${cal.calorie}</strong><span>kcal</span>
                    </div>
                    <div class="uk-width-4-5">
                        <em class="uk-text-meta">${cal.note}</em>
                    </div>
                </div>
                <div class="list-item-menu">
                    <a data-id="${cal.id}" class="edit-button" uk-toggle="target: #edit-form-container" uk-icon="icon: pencil"></a>
                    <a data-id="${cal.id}" class="delete-button" uk-icon="icon: trash"></a>
                </div>
            </li>`)
            sum += cal.calorie
            progressBar.value = sum
        })
    })

    caloriesList.addEventListener("click", function(e) {
        if (e.target.dataset.svg === "trash" || e.target.tagName === "rect") {
            const garbage = e.target.closest('a.delete-button')
            fetch(`http://localhost:3000/api/v1/calorie_entries/${garbage.dataset.id}`, {
                method: "DELETE"
            })
            .then(function(data) {
                const item = e.target.closest('.calories-list-item')
                const cals = parseInt(item.querySelector('strong').innerText)
                item.remove()
                sum -= cals
                progressBar.value = sum
            })
        }
        else if (e.target.dataset.svg === "pencil") {
            const pencil = e.target.closest('a.edit-button')
            const listItem = e.target.closest('.calories-list-item')
            editForm.calorie.value = listItem.querySelector('strong').innerText
            editForm.note.value = listItem.querySelector('em').innerText
            editForm.setAttribute("data-id", `${pencil.dataset.id}`)
        }
    })

    bmrForm.addEventListener("submit", function(e) {
        e.preventDefault()
        const weight = e.target.weight.value
        const height = e.target.height.value
        const age = e.target.age.value
        const lowerRange = document.querySelector("span#lower-bmr-range")
        const lowNum = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age)
        lowerRange.innerText = lowNum

        const higherRange = document.querySelector("span#higher-bmr-range")
        const highNum = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age)
        higherRange.innerText = highNum

        const avgNum = (lowNum + highNum) / 2
        progressBar.max = avgNum
    })

    editForm.addEventListener("submit", function(e) {
        e.preventDefault()
        fetch(`http://localhost:3000/api/v1/calorie_entries/${e.target.dataset.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                api_v1_calorie_entry: {
                    calorie: e.target.calorie.value,
                    note: e.target.note.value
                }
            })
        })
        .then(function(response) {
            return response.json()
        })
        .then(function(cal) {
            const myLi = caloriesList.querySelector(`li[data-id='${cal.id}']`)
            const originalCal = myLi.querySelector('strong').innerText
            myLi.querySelector('strong').innerText = cal.calorie
            myLi.querySelector('em').innerText = cal.note
            document.querySelector('.uk-modal').style.display = "none"
            sum -= originalCal
            sum += cal.calorie
            progressBar.value = sum
        })
    })

})