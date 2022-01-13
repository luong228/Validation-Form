function Validator(options) {
    var selectorRules = {};

    function getParent(element, selector) {
        while (element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement 
        }
        // return false;
    }
    
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        // var errorElement = inputElement.parentElement.querySelector(options.errorSelector)
        var errorMessage;

        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule, lấy rule đầu tiên
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            
            if(errorMessage)
                break;
        }
    
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        }
        else {
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            errorElement.innerText = '';
        }
        return !errorMessage;
    }

    var formElement = document.querySelector(options.form);
    // Main handle
    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
            
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            })
            

            if(isFormValid) {
                // submit bang javascript
                if (typeof options.onSubmit == 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {

                        switch(input.type) {
                            case 'radio':
                                if(!values[input.name]) {
                                    values[input.name] = ''
                                }
                                if(input.matches(':checked')) {
                                    values[input.name] = input.value
                                }
                                break
                            case 'checkbox':
                                if(!values[input.name]) {
                                    values[input.name] = []
                                }
                                if(input.matches(':checked')) {
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
                    options.onSubmit(formValues)   
                }

                else {
                    // submit mac dinh
                    formElement.submit();
                }
            }
            
        }

        options.rules.forEach(function (rule) {
            // Lưu lại rule của các selector
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test]

            }
            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                if (inputElement) {
                    // XỬ lý blur khỏi in put
                    inputElement.onblur = function () {
                        validate(inputElement, rule);
                    }
                    
                    // Xử lý mỗi khi người dùng nhập
                    
                    inputElement.oninput = function () {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                        errorElement.classList.remove('invalid')
                        errorElement.innerText = '';
                    }

                    
                }
            })

            
        })
        console.log(selectorRules)
    }

}

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regax = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regax.test(value) ? undefined : message || 'Trường này phải là Email';
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Độ dài tối thiếu phải là ${min} ký tự`;
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    // return value === formElement.querySelector("#password").value
    //     ? undefined
    //     : "Trường này không trùng khớp";

    return {
        selector : selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}