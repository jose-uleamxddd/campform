import { Routes } from '@angular/router';
import { ManantialForm } from './Camps-forms/manantial/manantial-form/manantial-form';
import { VerboForm } from './Camps-forms/verbo/Verbo Form/Verbo Form';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './admin/dashboard/dashboard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
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
    
];
