<?php

namespace Drupal\darts;

class Player {
        public $uid;
        public $name;
        static $players = [
              2 => "Dióbél Ádám",
              3 => "Földi András",
              5 => "Balogh Sándor",
              6 => "Barna Kss",
              7 => "Nyitrai Bence",
              8 => "Endrei Dávid",
              9 => "Szivos Attila",
              10 => "Gáspár Bálint",
              11 => "Czakó Gergely",
              12 => "Takács Gergő",
              13 => "Horváth Géza",
              14 => "Holló Szabó Zsófi",
              15 => "Szeles Imre",
              16 => "Holló Szabó Lajos",
              17 => "Pál Levente",
              19 => "Margaritovics Márkó",
              20 => "Tóth Norbert",
              21 => "Jimbo",
              22 => "Földi Péter",
              23 => "Illés László",
              24 => "Kaltner Richárd",
              25 => "Rio Róka",
              26 => "Petrovity Sándor",
              27 => "Peter Soma",
              28 => "Pelle Tamas",
              29 => "Varga Dudás István",
              30 => "Vörös Borisz",
              31 => "Török Gergő",
            ];


        function __construct($uid) {

            $this->uid = $uid;
            $this->name = self::$players[$uid];
        }

        function name() {
            return $this->name;
        }

        static function getPlayers() {
            return self::$players;
        }

    }