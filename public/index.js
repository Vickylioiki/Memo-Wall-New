

// const socket = io.connect();

document.querySelector('#createContent').addEventListener('submit', async function (e) {
    e.preventDefault()

    const formElement = e.target
    const content = formElement.content.value
    const image = formElement.image.files[0]

    const formData = new FormData()

    formData.append('content', content)
    formData.append('image', image)

    const res = await fetch('/memos/formidable', {
        method: 'POST',
        body: formData
    })
    if (res.ok) {
        loadMemos()
        document.querySelector('#createContent').reset();

    } else {
        let data = await res.json()
        // console.log(data.msg);
        console.err('System said : ', data.msg)
    }
})




document.querySelector('#manage_content').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target
    const formObject = {}
    formObject['username'] = form.username.value
    formObject['password'] = form.password.value
    const res = await fetch('/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formObject),
    })

    if (res.ok) {
        window.location = '/admin.html'
    }

})


async function loadMemos() {
    const res = await fetch('/memos'); //default GET method
    const memos = await res.json(); //拎反JSON data落黎
    const memoContainer = document.querySelector('#memos')
    console.log('memos: ' + memos)
    memoContainer.innerHTML = '' //每次要清空塊板, 唔係會一直接住上一份更新
    for (let memo of memos) {
        memoContainer.innerHTML += `
        <div class="memo col-md-3">
            <div class="oldMemo">
                <div class="icon-wrapper delete">
                    <i class="bi bi-trash3-fill"></i>
                </div>
                <div class="content">
                    <input type="text" class="memo_text" value="${memo.content}"></input>
                    <img class="upload-img" src="http://localhost:8080/upload/${memo.image}"
                        alt="">
                </div>
                <div class="icon-wrapper edit">
                    <i class="bi bi-pencil-square"></i>
                </div>
                <div class="like-wrapper like>
                <i class="bi bi-heart-fill"></i>
                <span class="like-number"></span>
                </div>
            </div>
        </div> `
    }

    const memoDelete = [...document.querySelectorAll('.delete')];
    for (let index in memoDelete) {

        memoDelete[index].addEventListener('click', async function () {
            let memoIndex = memos[index].id;
            const res = await fetch(`http://localhost:8080/memos/id/${memoIndex}`, {
                method: 'delete',
                headers: {
                    'content-type': 'application/json',
                }
            })

            if (res.ok) {
                loadMemos();
            }

        })


    }

    const memoEdit = [...document.querySelectorAll('.edit')];
    for (let index in memoEdit) {
        memoEdit[index].addEventListener('click', async function () {
            let editText = document.querySelectorAll('.memo_text')[index].value;
            let memoIndex = memos[index].id;
            console.log('text:' + editText)
            const res = await fetch(`http://localhost:8080/memos/id/${memoIndex}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    contentNew: editText
                })


            })

            if (res.ok) {
                loadMemos();
            }
        })
    }
}




loadMemos()