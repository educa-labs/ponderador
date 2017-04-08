var app = angular.module('Simulador_InfoPSU', ['ngMaterial', 'ngMessages','ui.router']);


app.config(function($stateProvider, $urlRouterProvider) {
  // si la ruta no existe llevar a ingresar datos
  $urlRouterProvider.otherwise('/ingresar');

  // ruta para ingresar
  $stateProvider
  .state("ingresar", {
    url: "/ingresar",
    templateUrl: 'templates/ingresar.html',
    controller: 'CtrlIngreso'
  })


  // ruta para resultados
  .state("resultados", {
    url: "/resultados",
    templateUrl: 'templates/resultados.html',
    controller: 'CtrlResultados'
  })

  // ruta para simular
  .state('simular', {
    url: '/simular',
    templateUrl: 'templates/simular2.html',
    controller: 'CtrlSimulacion',
    data: {
      authorization: true,
      redirectTo: 'ingresar'
    }
  });

});

// Codigo para poder entrar a simular 
app.run(function($rootScope, $state, Authorization) {

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if (!Authorization.authorized) {
      if (Authorization.memorizedState && (!_.has(fromState, 'data.redirectTo') || toState.name !== fromState.data.redirectTo)) {
        Authorization.clear();
      }
      if (_.has(toState, 'data.authorization') && _.has(toState, 'data.redirectTo')) {
        if (_.has(toState, 'data.memory')) {
          Authorization.memorizedState = toState.name;
        }
        $state.go(toState.data.redirectTo);
      }
    }

  });

  $rootScope.onLogout = function() {
    Authorization.clear();
    $state.go('ingresar');
  };
});


// Servicio de Autorizacion
app.service('Authorization', function($state) {

  this.authorized = false,
  this.memorizedState = null;

  var
  clear = function() {
    this.authorized = false;
    this.memorizedState = null;
  },

  go = function(fallback) {
    this.authorized = true;
    var targetState = this.memorizedState ? this.memorizedState : fallback;
    $state.go(targetState);
  };

  return {
    authorized: this.authorized,
    memorizedState: this.memorizedState,
    clear: clear,
    go: go
  };
});

