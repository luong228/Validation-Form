function Validator(formSelector) {
    var _this = this

    function getParent(element, selector) {

        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }

            element = element.parentElement;
        }
    }

    var formRules = {};

    /*
     quy uoc tao Rule:
      - Neu co loi thi return messgae 
      - Neu khong return undefine
    */
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },

        email: function (value) {
            var regax = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regax.test(value) ? undefined : 'Trường này phải là Email';
        },

        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Độ dài tối thiếu phải là ${min} ký tự`;

            }
        },

        max: function (max) {
            return function (max) {
                return value.length <= max ? undefined : `Độ dài tối đa phải là ${max} ký tự`;

            }
        },

    };

    var formElement = document.querySelector(formSelector);

    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')

        for (var input of inputs) {
            if (input.getAttribute('rules')) {
                var rules = input.getAttribute('rules').split('|')
                for (var rule of rules) {
                    if (Array.isArray(formRules[input.name])) {
                        formRules[input.name].push(rule.includes(':') ? validatorRules[rule.split(':')[0]](rule.split(':')[1]) : validatorRules[rule])
                    } else formRules[input.name] = [validatorRules[rule]]
                }
            }
            // Lang nghe su kien input, change
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }
/*
        for (var input of inputs) {

            var rules = input.getAttribute('rules').split('|');

            for (var rule of rules) {
                var ruleHasValue = rule.includes(':')

                var ruleFunc = validatorRules[rule]

                if (ruleHasValue) {
                    var ruleInfo = rule.split(':')
                    ruleFunc = validatorRules[ruleInfo[0]]([ruleInfo[1]]);
                }

                if (ruleHasValue) {

                }
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                }
                else {
                    formRules[input.name] = [ruleFunc]
                }
            }
                
        // Lang nghe su kien input, change
        input.onblur = handleValidate;
        input.oninput = handleClearError;

    }*/
    function handleValidate(e) {
        var rules = (formRules[e.target.name])
        var errorMessage

        for (var rule of rules) {
            errorMessage = rule(e.target.value);
            if (errorMessage) break;
        }
        // rules.find(function (rule) {
        //     errorMessage = rule(e.target.value);
        //     return errorMessage;
        // })

        // Neu co loi thi hien thi loi ra UI
        if (errorMessage) {

            var formGroup = getParent(e.target, '.form-group');

            if (!formGroup) { return; }

            var formMessage = formGroup.querySelector('.form-message');
            if (formMessage) {
                formMessage.innerText = errorMessage;
                formGroup.classList.add('invalid')
            }
        }

        return !errorMessage
    }

    function handleClearError(e) {
        var formGroup = getParent(e.target, '.form-group');
        if (!formGroup) { return; }
        if (formGroup.classList.contains('invalid')) {
            formGroup.classList.remove('invalid')

            var formMessage = formGroup.querySelector('.form-message');
            formMessage.innerText = ''
        }
    }

}

console.log(this)
// Xu ly hanh vi submit form
formElement.onsubmit = function (e) {
    e.preventDefault();
    var inputs = formElement.querySelectorAll('[name][rules]')
    var isValid = true;

    for (var input of inputs) {
        if (!handleValidate({ target: input })) {
            isValid = false;
        }
    }

    if (isValid) {
        if (typeof _this.onSubmit === 'function') {
            var enableInputs = formElement.querySelectorAll('[name]:not([disable])')
            var formValues = Array.from(enableInputs).reduce(function (values, input) {

                switch (input.type) {
                    case 'radio':
                        if (!values[input.name]) {
                            values[input.name] = ''
                        }
                        if (input.matches(':checked')) {
                            values[input.name] = input.value
                        }
                        break
                    case 'checkbox':
                        if (!values[input.name]) {
                            values[input.name] = []
                        }
                        if (input.matches(':checked')) {
                            values[input.name].push(input.value)
                        }
                        break
                    case 'file':
                        values[input.name] = input.files
                        break;
                    default:
                        values[input.name] = input.value
                }
                return values
                // return (values[input.name] = input.value) && values;
            }, {});
            _this.onSubmit(formValues)
        }
        else {
            formElement.submit();
        }

    }
}
}