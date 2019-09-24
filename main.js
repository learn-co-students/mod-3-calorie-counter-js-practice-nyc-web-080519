document.addEventListener("DOMContentLoaded", () => {getStuffFromApi()
  console.log("LOADED")

  const caloriesList = document.getElementById("calories-list")
  const calorieIntakeForm = document.getElementById("new-calorie-form")
  const progressBar = document.querySelector("progress")
  const bmrContainer = document.getElementById("bmr-container")
  const bmrForm = document.getElementById("bmr-calulator")
  const editFormContainer = document.getElementById("edit-form-container") 
  const editForm = document.getElementById("edit-calorie-form") 
  // const calArr = [];
  let calSum = 0;

  // making fetch happen
  function getStuffFromApi(){
    return fetch("http://localhost:3000/api/v1/calorie_entries")
      .then(resp => resp.json())
      .then(data => {
        data.forEach(renderFromDb)
        data.forEach(item => {
          calSum += item.calorie //going to need to do this after a post, then delete after a delete, then delete and add after an edit (or do I write a method to iterate over all the lis and get the total every time a change is made?)
        })
        updateProgress(calSum)
      })
  }


  function postReq(bodyObj){
    return fetch("http://localhost:3000/api/v1/calorie_entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(bodyObj)
    })
    .then(resp => {
      // console.log(resp)
      if (resp.ok){
        return resp.json()
      } else {
        throw `${resp.status}: ${resp.statusText}`
      }
    })
  }

  function patchReq(bodyObj, id){
    return fetch(`http://localhost:3000/api/v1/calorie_entries/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(bodyObj)
    })
    .then(resp => {
      console.log(resp)
      if (resp.ok){
        return resp.json()
      } else {
        throw `${resp.status}: ${resp.statusText}`
      }
    })
  }

  function deleteObj(id) {
    return fetch(`http://localhost:3000/api/v1/calorie_entries/${id}`, {
      method: "DELETE"
    })//.then(resp => resp.json()) //don't include this line if your controller doesn't send anything back (not sure i need it even if it does render something)
  }


  // render bender
  function renderFromDb(dataObj) {
    caloriesList.insertAdjacentHTML("afterbegin", `
      <li class="calories-list-item" data-id=${dataObj.id}>
        <div class="uk-grid">
          <div class="uk-width-1-6">
            <strong>${dataObj.calorie}</strong>
            <span>kcal</span>
          </div>
          <div class="uk-width-4-5">
            <em class="uk-text-meta">${dataObj.note}</em>
          </div>
        </div>
          <div class="list-item-menu">
            <a data-id="${dataObj.id}" data-action="edit" class="edit-button" uk-icon="icon: pencil" uk-toggle="target: #edit-form-container" ></a>
            <a data-id="${dataObj.id}" data-action="delete" class="delete-button" uk-icon="icon: trash" ></a>
          </div>
        </li>
    `)
  }



  const updateProgress = (calSum) => {
    progressBar.value = calSum
  }



  //creeper listeners
  calorieIntakeForm.addEventListener("submit", e => {
    e.preventDefault();
    // console.log(e.target.calorie.value, e.target.note.value)
    const calorie = e.target.calorie.value;
    const note = e.target.note.value
    let renderObj = {
      calorie: calorie,
      note: note
    }
    let postObj = {api_v1_calorie_entry: renderObj}

    postReq(postObj)
    .then(item => {
      renderFromDb(item);
      calSum += item.calorie
      updateProgress(calSum)
    })
    .catch(err => {
      alert(err)
    })
  })

  //A user can delete a calorie intake entry by clicking the respective trash icon. You decide between optimistic or pessistic rendering.
  caloriesList.addEventListener("click", e => {
    const id = e.target.closest("a").dataset.id;
    let calInput = editForm.querySelector("input")
    let noteInput= editForm.querySelector("textarea")
    console.log(id)

    if (e.target.closest("a").dataset.action === "delete") {
      const liToRemove = e.target.closest("li")
      let cal = parseInt(liToRemove.querySelector("strong").innerText)
      deleteObj(id)
      .then(data => {
        liToRemove.remove()
        calSum -= cal
        updateProgress(calSum)
        alert("Delete successful")
      })

    } else if (e.target.closest("a").dataset.action === "edit") {
      console.log("trying to edit")
      const liTarget = e.target.closest("li")
      let cal = parseInt(liTarget.querySelector("strong").innerText)
      let note = liTarget.querySelector("em").innerText

      // prepopulate fields
      calInput.value = cal;
      noteInput.value = note;
   
      // patch request needs another event listener
      editForm.addEventListener("submit", e => {
        e.preventDefault()
        console.log(id)
        const calorieEdit = e.target.calorie.value
        const noteEdit = e.target.note.value
        let bodyObj = { 
          api_v1_calorie_entry: {
            calorie: calorieEdit,
            note: noteEdit
          }
        }

        calSum -= cal
        updateProgress(calSum)
 
        patchReq(bodyObj, id)
        // re-render HTML based on patch response, plus delete the original cal amount from the calSum and add the new
        .then(item => {
          liTarget.querySelector("strong").innerText = parseInt(item.calorie)
          liTarget.querySelector("em").innerText = item.note
          calSum += parseInt(item.calorie)
          updateProgress(calSum)
        })
        .catch(err => {
          alert(err)
        })
      }) //closes edit submit form event listener
    } //closes else if
  })

//   Clicking the "Calculate BMR" button should update the span#lower-bmr-range and span#higher-bmr-range with the appropriate values"
// forumla for lower-range: BMR = 655 + (4.35 x weight in pounds) + (4.7 x height in inches) - (4.7 x age in years)
// formula for upper-range: BMR = 66 + (6.23 x weight in pounds) + (12.7 x height in inches) - (6.8 x age in years)
// Clicking the calculate BMR button should also set the #progress-bar's max attribute to the average of the two numbers above.

  bmrForm.addEventListener("submit", e => {
    e.preventDefault();
    const weight = e.target.weight.value;
    const height = e.target.height.value;
    const age = e.target.age.value;
    //DO SOME MATH
    let bmrLower = Math.round(65 + (4.35 * weight) + (4.7 * height) - (4.7 * age));
    let bmrUpper = Math.round(66 + (6.23 * weight) + (12.7 * height) - (6.8 * age));
    let bmrAvg = Math.round((bmrLower + bmrUpper) / 2);
    // console.log(bmrLower, bmrUpper, bmrAvg, progressBar.max)

    const lowerSpan = document.getElementById("lower-bmr-range");
    const upperSpan = document.getElementById("higher-bmr-range");
    
    progressBar.max = bmrAvg;
    progressBar.value = calSum;
    // debugger;
    lowerSpan.innerText = bmrLower;
    upperSpan.innerText = bmrUpper;
 
  })








})