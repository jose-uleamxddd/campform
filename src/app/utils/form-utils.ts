import { AbstractControl, FormArray, FormGroup, ValidationErrors } from "@angular/forms";
import { AsapAction } from "rxjs/internal/scheduler/AsapAction";




async function sleep() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 2500);
    })
}
export class FormUtils {

    static namePattern = '^([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)( [a-zA-ZáéíóúÁÉÍÓÚñÑ]+)+$';
    static emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
    static notOnlySpacesPattern = '^[a-zA-Z0-9]+$';
    static straiderPattern = '^(?!strider$).*$';
    

    static getTextError(errors: ValidationErrors) {
        for (const key of Object.keys(errors)) {
            switch (key) {
                case 'required':
                    return 'Este campo es obligatorio';
                case 'minlength':
                    return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
                case 'min':
                    return `El valor mínimo es ${errors['min'].min}`;
                case 'email':
                    return `El valor ingresado no es un correo válido`;
                case 'emailTaken':
                    return `El correo ya está en uso`;
                case 'isStraider':
                    return `El nombre de usuario no puede ser "strider"`;
                case 'pattern':
                    if (errors['pattern'].requiredPattern === FormUtils.emailPattern) {
                        return `El valor ingresado no luce como un correo válido`;
                    }
                    return `El valor ingresado no cumple con el formato requerido`;
                default:
                    return 'Campo inválido';
            }
        }
        return null;
    }



    static isValidField(form: FormGroup, fieldName: string): boolean | null {
        return (!!form.controls[fieldName].errors &&
            form.controls[fieldName].touched
        )
    }
    static getFieldError(form: FormGroup, fieldName: string): string | null {
        if (form.controls[fieldName].errors == null) {
            return null;
        }
        const errors = form.controls[fieldName].errors ?? {};
        return FormUtils.getTextError(errors);

    }
    static isValidFieldInArray(formArray: FormArray, index: number) {
        return (
            formArray.controls[index].errors && formArray.controls[index].touched
        );
    }

    static getFieldErrorInArray(formArray: FormArray, index: number): string | null {
        if (formArray.controls.length === 0) return null;

        if (formArray.controls[index].errors == null) {
            return null;
        }
        const errors = formArray.controls[index].errors ?? {};

        return FormUtils.getTextError(errors);
    }

    static isFieldOneEqualFieldTwo(field1: string, field2: string) {
        return (formGroup: AbstractControl) => {
            const fiel1Value = formGroup.get(field1)?.value;
            const fiel2Value = formGroup.get(field2)?.value;
            return (fiel1Value === fiel2Value) ? null : { notEqual: true };
        }
    }
    static async checkingServerResponse(control: AbstractControl): Promise<ValidationErrors | null> {
        console.log('Checking server response...');
        await sleep(); //esperar la respuesta del servidor
        const formValue = control.value;
        if (formValue === 'hola@mundo.com') {
            return {
                emailTaken: true
            };
        }
        return null;
    }

    static notStrider (control:AbstractControl): ValidationErrors | null {
        const formValue = control.value?.toLowerCase().trim();
        if (formValue === 'strider'  ) {
            return {
                isStraider: true
            };
        }
        return null;
    }
}

