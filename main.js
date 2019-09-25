document.addEventListener('DOMContentLoaded', (event) => {

    const caloriesList = document.querySelector("#calories-list");
    const progress = document.querySelector(".uk-progress");
    const newCalorieForm = document.querySelector("#new-calorie-form > div > button");
    const editCalorieForm = document.querySelector("#edit-calorie-form")
    const saveChangesButton = document.querySelector("#edit-calorie-form > div > button")

    newCalorieForm.addEventListener("click", function(e) {
        if (e.target.className === "uk-button uk-button-default") {
            e.preventDefault();
            const calorieInput = document.querySelector("#new-calorie-form > div > div:nth-child(1) > input");
            const noteInput = document.querySelector("#new-calorie-form > div > div:nth-child(2) > textarea")
            fetch("http://localhost:3000/api/v1/calorie_entries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    api_v1_calorie_entry: {
                        calorie: calorieInput.value,
                        note: noteInput.value
                    }
                })
            }).then(response => response.json())
            .then(json => addEntry(json))
        }
    })

    caloriesList.addEventListener("click", function(e) {
        // Edit button handling
        if (e.target.parentElement.className === "edit-button uk-icon") {

            const myLi = e.target.parentElement.closest("li");
            editCalorieForm.querySelector("input").value = myLi.querySelector("strong").innerHTML;
            editCalorieForm.querySelector("textarea").value = myLi.querySelector("em").innerHTML;
            const myButton = editCalorieForm.querySelector("button")
            myButton.setAttribute("data-id", myLi.dataset.item_id)

            myButton.addEventListener("click", function(e) {
                e.preventDefault();
                fetch(`http://localhost:3000/api/v1/calorie_entries/${myButton.dataset.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Accepts": "application/json"
                    },
                    body: JSON.stringify({
                        api_v1_calorie_entry: {
                            calorie: editCalorieForm.querySelector("input").value,
                            note: editCalorieForm.querySelector("textarea").value
                        }
                    })
                 }).then(response => response.json())
                 .then(json => update(json))
            })
        }
        // Delete button handling
        else if(e.target.parentElement.className === "delete-button uk-icon") {
            const myLi = e.target.parentElement.closest("li");
            fetch(`http://localhost:3000/api/v1/calorie_entries/${myLi.dataset.item_id}`,
                {
                    method: "DELETE"
                }
            ).then(function() {
                myLi.remove();
            })
        }
    })

    function addEntry(entry) {
        caloriesList.insertAdjacentHTML("afterbegin",
            `<li class="calories-list-item" data-item_id="${entry.id}">
                <div class="uk-grid">
                <div class="uk-width-1-6">
                    <strong>${entry.calorie}</strong>
                    <span>kcal</span>
                </div>
                <div class="uk-width-4-5">
                    <em class="uk-text-meta">${entry.note}</em>
                </div>
                </div>
                <div class="list-item-menu">
                <a class="edit-button" uk-toggle="target: #edit-form-container" uk-icon="icon: pencil"></a>
                <a class="delete-button" uk-icon="icon: trash"></a>
                </div>
            </li>`
        )
        const currentProgressValue = parseInt(progress.value);
        progress.value = currentProgressValue + entry.calorie;
    }

    function update(entry) {
       const myLi = caloriesList.querySelector(`[data-item_id="${entry.id}"]`);
       myLi.querySelector("strong").innerHTML = entry.calorie;
       myLi.querySelector("em").innerHTML = entry.note;
    }
});
