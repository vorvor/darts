<?php

namespace Drupal\darts;

class PersonalGame {
    public $player;
    public $throws;
    public $winner;
    public $firstPlayer;
    public $secondPlayer;
    public $sum;
    public $date;
    public $gameid;

    function __construct($gameid) {

        $this->gameid = $gameid;
        return $this;
    }

    function setDate($time) {
        $this->date = date('Y-m-d', $time);

        return $this;
    }

    function setPlayer($uid) {
        $this->player = new Player($uid);

        return $this;
    }

    function setFirstPlayer($uid) {
        $this->firstPlayer = new Player($uid);

        return $this;
    }

    function setSecondPlayer($uid) {
        $this->secondPlayer = new Player($uid);

        return $this;
    }

    function setWinner($uid) {
        $this->winner = new Player($uid);

        return $this;
    }

    function setThrows($throws) {
        $this->throws = $throws;
        $this->sum = array_sum($throws) / count($throws);

        return $this;
    }

}