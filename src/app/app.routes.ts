import { Routes } from '@angular/router';
import { ManantialForm } from './Camps-forms/manantial/manantial-form/manantial-form';
import { VerboForm } from './Camps-forms/verbo/Verbo Form/Verbo Form';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './admin/dashboard/dashboard';
import { authGuard } from './guards/auth.guard';
import { PincipalPage } from './principal page/Pincipal-page/Pincipal-page';
import { Crossworlds } from './Camps-forms/crossworlds/crossworlds';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'principal-page',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'admin',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'verbo-form',
        component: VerboForm
    },
    {
        path: 'manantial-form',
        component: ManantialForm
    },
    {
        path: "principal-page",
        component: PincipalPage
    },
    {
        path: 'crossworlds-form',
        component: Crossworlds
    }
    
];
