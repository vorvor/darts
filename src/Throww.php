<?php

namespace Drupal\darts;

class Throww {
    public $player;
    public $score;
    public $remain;
    public $time;
    public $id;

    function __construct($player, $score, $remain, $time, $id) {
        $this->player = $player;
        $this->score = $score;
        $this->remain = $remain;
        $this->time = $time;
        $this->id = $id;
    }
}