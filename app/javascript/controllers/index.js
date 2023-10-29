// This file is auto-generated by ./bin/rails stimulus:manifest:update
// Run that command whenever you add a new controller or create them with
// ./bin/rails generate stimulus controllerName
import { application } from './application';

//-------------------
import ContentLoader from 'stimulus-content-loader';
application.register('content-loader', ContentLoader);

//-------------------
import HelloController from './hello_controller';
application.register('hello', HelloController);

//-------------------
import ModalComponentController from './modal_controller';
application.register('modal', ModalComponentController);

//-------------

import RecipeMainController from './recipe_controller';
application.register('recipe', RecipeMainController);

//-------------

import MealPlanController from './meal_plan_controller';
application.register('mealplan', MealPlanController);
//-------------

import TurboModalController from './turbo_modal_controller';
application.register('turbo-modal', TurboModalController);
//-------------

import NavigationController from './navigation_controller';
application.register('navigation', NavigationController);

//-------------
import ProfileFormController from './profile_form_controller';
application.register('profile-form', ProfileFormController);

//-------------

import Multiselect from './multiselect_controller';
// import { Multiselect } from '@wizardhealth/stimulus-multiselect';
application.register('multiselect', Multiselect);
