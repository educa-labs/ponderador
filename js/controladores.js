// controlador principal
// aca se guarda toda la info del usuario
function validateRut(_value) {
  if(typeof _value !== 'string') return false;
  var t = parseInt(_value.slice(0,-1), 10), m = 0, s = 1;
  while(t > 0) {
    s = (s + t%10 * (9 - m++%6)) % 11;
    t = Math.floor(t / 10);
  }
  var v = (s > 0) ? (s-1)+'' : 'K';
  return (v === _value.slice(-1));
}

app.controller('mainController', function($scope, $http) {
    // informacion del usario
    $scope.user = {
      name: '',
      rut: '',
      mail: '',
      region: '',
      cel: '',
      uid: -1,
      cid: -1,
      nem: 0,
      ran: 0,
      mat: 0,
      len: 0,
      opt: 0,
      cie: 0,
      his: 0,
      switch: ''
    };

    $scope.pressed = false;

    //Validador de rut
    $scope.validateRut = function(_value) {
      if(typeof _value !== 'string') return false;
      var t = parseInt(_value.slice(0,-1), 10), m = 0, s = 1;
      while(t > 0) {
        s = (s + t%10 * (9 - m++%6)) % 11;
        t = Math.floor(t / 10);
      }
      var v = (s > 0) ? (s-1)+'' : 'k';
      if (!(v === _value.slice(-1))){
        alert("Rut incorrecto")
        return false;
      };
      return true;
    }


    $scope.submsg = "";
    $scope.getSubject = function(){
      $http.get("http://www.pondera.cl/get_subjects/"+$scope.user.cid)
      .then(function (response) {
        if(response.data.result == 0){
          $scope.submsg = "Esta carrera pondera con Ciencias"
        }
        else if(response.data.result == 1){
          $scope.submsg = "Esta carrera pondera con Historia"
        }
        else if(response.data.result == 2){
          $scope.submsg = "Esta carrera pondera con Ciencias o Historia"
        };
        $scope.subject = response.data.result;
        $scope.pressed = false;
      });

    };

    $scope.umsg = "";
    $scope.result = {"nem": 0, "ran": 0, "mat": 0, "len": 0, "opt": 0, "pond": 0, "corte": 0, "msg": ""};
    $scope.regiones = ["RM Región Metropolitana","XV - Arica y Parinacota", "I - Tarapacá", "II - Antofagasta", "III - Atacama", "IV- Coquimbo", "V - Valparaíso", "VI - O’Higgins", "VII - Maule", "VIII - Biobío", "IX - Araucanía", "XIV - Los Ríos", "X - Los Lagos", "XI - Aysén", "XII - Magallanes"];
    //Funcion para post en el server
    $scope.simular = function(form){
      if ($scope.pressed){
        alert("Por favor espera a que el servidor termine de procesar tu información.");
        return;
      }
      if (!form.$valid || $scope.user.cid == -1 || $scope.user.uid == -1){
        alert("Recuerda rellenar los puntajes y seleccionar una universidad y carrera!");
        return;
      }
      else if (($scope.subject == 0 && $scope.user.cie == undefined) || 
        ($scope.subject == 1 && $scope.user.his == undefined)
       || ($scope.user.cie == undefined && $scope.user.his == undefined)){
        alert("Recuerda rellenar el puntaje de tu/s prueba/s optativa!");
        return;
      }

      if ($scope.user.cie == undefined){
        $scope.user.cie = 0;
      }
      if ($scope.user.his == undefined){
        $scope.user.his = 0;
      }
      var req = {
       method: 'POST',
       url: 'http://www.pondera.cl/simulation',
       headers: {
         'Content-Type': undefined
       },
      data: $scope.user
     };
      $scope.pressed = true;
      $http(req).then(function(r){
        $scope.result = r.data;
        if ($scope.result.web != ""){
          $scope.umsg = "Visita "+$scope.result.web+" para más información";
        }
        else {
          $scope.umsg = "Visita la página de la universidad para más información";
        }

      });

        
      

    };

    $scope.getCarreras = function(){
      $http.get("http://www.pondera.cl/get_careers/"+$scope.user.uid)
      .then(function (response) {$scope.carreras = response.data.result;});
      $scope.cid = -1;
      $scope.pressed = false;
    };
    $scope.carreras = [];

  });


// controlador de bienvenida
app.controller('CtrlBienvenida', function($scope) {

    $scope.mensaje = "Buena Shoro este es la páginad de bienvenida"
    $scope.showHints = true;

});



// controlador de simulacion
app.controller('CtrlSimulacion', function($scope, $http) {
    $scope.porcentajes = {
      nem: '',
      ranking: '',
      mate: '',
      leng: '',
      optativa: ''
    }
    

    $scope.mensaje = "Buena";

    $scope.id = "";

    $http.get("http://www.pondera.cl/get_universities")
    .then(function (response) {$scope.ues = response.data.ues;});


    //$scope.ues = $http.get("http://www.infopsu.com:5000/get_universities")
    //.then(function (response) {$scope.user.name = response.data.ues[2].name;});

});


// controlador de ingreso de usuario
app.controller('CtrlIngreso', function($scope, $state, Authorization, $mdDialog) {
  $scope.condiciones = false;
  $scope.ingresar = function() {
    if ($scope.condiciones){
    Authorization.go('simular');
    }
    else{
      alert("Debes aceptar los términos y condiciones para participar");
    }
  };

  $scope.showBases = function(ev) {
    $mdDialog.show({
      controller: CtrlBases,
      templateUrl: 'templates/bases.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
  };

  $scope.showPremios = function(ev) {
    $mdDialog.show({
      controller: CtrlBases,
      templateUrl: 'templates/premios.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
  };



















});

function CtrlBases($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  };


app.controller('CtrlResultados', function($scope, $http, $state, Authorization) {

  $scope.resultados = {
    user: '',
    pass: ''
  };

  // funcion para entrar a ver los resultados
  $scope.saberresultados = function(){
    window.location.href = "http://pondera.cl/resultados.csv?user=" + $scope.resultados.user + "&pass=" + $scope.resultados.pass;
    };


  $scope.getContador = function(){
      $http.get("http://pondera.cl/cantidad?user=" + $scope.resultados.user + "&pass=" + $scope.resultados.pass)
      .then(function (response) {$scope.contador = response.data;});
    };   

  $scope.sabercontador  = function(){
    window.location.href = "http://pondera.cl/cantidad?user=" + $scope.resultados.user + "&pass=" + $scope.resultados.pass;
  }
});






app.controller('DemoCtrl', function($scope, $mdDialog, $timeout) {
      var self = this;

      self.hidden = false;
      self.isOpen = false;
      self.hover = false;

      // On opening, add a delayed property which shows tooltips after the speed dial has opened
      // so that they have the proper position; if closing, immediately hide the tooltips
      $scope.$watch('demo.isOpen', function(isOpen) {
        if (isOpen) {
          $timeout(function() {
            $scope.tooltipVisible = self.isOpen;
          }, 600);
        } else {
          $scope.tooltipVisible = self.isOpen;
        }
      });

      self.items = [
        { name: "Twitter", icon: "img/twitter.svg", direction: "bottom", url:"https://twitter.com/?status=Calcula tu ponderación junto a http://www.pondera.cl y participa  por increíbles premios" },
        { name: "Facebook", icon: "img/facebook.svg", direction: "top", url:"https://www.facebook.com/sharer/sharer.php?u=http://www.pondera.cl" },
        { name: "Google Hangout", icon: "img/instagram.svg", direction: "bottom", url:"http://www.instagram.com/infopsu" }
      ];

      self.openDialog = function($event, item) {
        // Show the dialog
        $mdDialog.show({
          clickOutsideToClose: true,
          controller: function($mdDialog) {
            // Save the clicked item
            this.item = item;

            // Setup some handlers
            this.close = function() {
              $mdDialog.cancel();
            };
            this.submit = function() {
              $mdDialog.hide();
            };
          },
          controllerAs: 'dialog',
          templateUrl: 'dialog.html',
          targetEvent: $event
        });
      }
    });

