<?php

namespace Drupal\darts;

class Leg {
    public $throws;
    public $winner;
    public $firstPlayer;
    public $secondPlayer;

    function addThrow($player, $score, $remain, $time, $id) {
        $this->throws[] = new Throww($player, $score, $remain, $time, $id);
    }

    function setWinner($player) {
        $this->winner = $player;
    }

    function getAvg($uid) {
        $sum = [];
        foreach ($this->throws as $throw) {

            $sum[$throw->player->uid][] = $throw->score;
        }

        return array_sum($sum[$uid]) / count($sum[$uid]);
    }
}