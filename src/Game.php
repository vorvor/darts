<?php

namespace Drupal\darts;

use Drupal\darts\Players;
use Drupal\darts\Throww;
use Drupal\darts\Leg;

class Game {
        public $legcount;
        public $legs;
        public $players;
        public $gameid;
        public $start;
        public $end;
        public $metadata;
        public $result;

        public $maxThrow;

        function __construct($gameid) {

            $this->gameid = $gameid;
            
            $database = \Drupal::database();

            $query = $database->select('darts_game', 'g');
            $query
            ->fields('g', [])
            ->condition('g.gameid', $gameid)
            ->orderBy('g.id', 'ASC');

            $results = $query->execute()->fetchAll();

            $score = [];
            // Separate throws by which leg.
            $leg = 1;
            $players = [];
            foreach ($results as $row) {

                $this->metadata = $row->data;

                if (!isset($this->start)) {
                    // First throw is the game start.
                    $this->start = $row->created;
                }

                // Fill players.
                if (!isset($this->players[$row->uid])) {
                    $this->players[$row->uid] = new Player($row->uid);
                }

                if (!isset($score[$row->uid])) {
                    $score[$row->uid] = 0;
                }
                $score[$row->uid] += $row->score;

                if ($score[$row->uid] == 501) {
                    $this->legs[$leg]->setWinner($this->players[$row->uid]);
                    $this->legs[$leg]->addThrow($this->players[$row->uid], $row->score, 501 - $score[$row->uid], $row->created, $row->id);

                    $leg++;
                    //$this->legs[$leg] = new Leg();

                    $score = [];
                    $score[$row->uid] = 0;

                } else {

                    if (!isset($this->legs[$leg])) {
                        $this->legs[$leg] = new Leg();
                    };

                    $this->legs[$leg]->addThrow($this->players[$row->uid], $row->score, 501 - $score[$row->uid], $row->created, $row->id);
                }

            }

            $leg--;

            if (isset($this->legs[$leg])) {
                $this->legs[$leg]->setWinner($this->players[$row->uid]);
            }
            
            $this->legcount = $leg;
            // Last throw is the game end.
            $this->end = $row->created;


            // set game winner and who start.
            foreach ($this->players as $player) {
                $winner[$player->uid] = 0;
            }

            foreach ($this->legs as $leg) {

                if (!is_object($leg->winner)) {
                    dpm($this);
                }

                if (isset($leg->winner) && !isset($winner[$leg->winner->uid])) {
                    $winner[$leg->winner->uid] = 0;
                }
                $winner[$leg->winner->uid]++; 

                foreach ($leg->throws as $throw) {
                    $leg->firstPlayer = $throw->player;
                    $leg->firstPlayerAvg = $leg->getAvg($leg->firstPlayer->uid);
                    $leg->secondPlayer = $this->otherPlayer($throw->player->uid);
                    $leg->secondPlayerAvg = $leg->getAvg($leg->secondPlayer->uid);
                    break;
                }
            }
            
            $this->winner = new Player(array_search(max($winner), $winner));

            rsort($winner);

            $this->result = $winner[0] . ' - ' . $winner[1];

            return $this;

        }

        function addVariable($param, $value) {
            $this->$param = $value;
        }

        function otherPlayer($uid) {
            foreach ($this->players as $player) {
                if ($player->uid !== $uid) {
                    return $player;
                }
            }
        }

        function findThrowParentGame($id) {

            foreach ($this->legs as $leg) {
                foreach ($leg->throws as $throw) {

                    if ($throw->id == $id) {
                        return $this->gameid;
                    }
                }
            }
        }
       

    }