<?php

namespace Drupal\darts;

use Drupal\darts\Player;
use Drupal\darts\PersonalGame;

class GameStat {
       public $games;

        function __construct() {

            $database = \Drupal::database();

            $query = $database->select('darts_game', 'g');
            $query
            ->fields('g', [])
            //->condition('g.gameid', 3)
            ->orderBy('g.gameid', 'ASC')
            ->orderBy('g.id', 'ASC');


            $results = $query->execute()->fetchAll();

            $play = [];
            $sum = [];
            $game = [];
            $i = 0;
            
            foreach ($results as $row) {

                if (!isset($start)) {
                    $start = $row->uid;
                    $date = $row->created;
                } elseif (!isset($second)) {
                    $second = $row->uid;
                }

                $play[$row->uid][] = $row->score . ':' . $row->gameid . ':' . $row->id . ':' . $row->uid;
                if (isset($sum[$row->uid])) {
                    $sum[$row->uid] += $row->score;
                } else {
                    $sum[$row->uid] = $row->score;
                }

                if ($sum[$row->uid] >= 501 || (isset($currentgame) && $row->gameid <> $currentgame)) {
                    
                    foreach ($play as $key => $oneplay) {
                        //$this->games[$key][] = $oneplay;

                        $game = new PersonalGame($row->gameid);
                        $game->setPlayer($key)
                        ->setThrows($oneplay)
                        ->setFirstPlayer($start);
                        if (isset($second)) {
                            $game->setSecondPlayer($second);
                        }
                        $game->setWinner($row->uid)
                        ->setDate($date);

                        

                        $this->games[] = $game;
                    }

                    $play = [];
                    $sum = [];
                    unset($start);
                    unset($second);
                }

                $currentgame = $row->gameid;

                $i++;
                if ($i > 15) {
                    //break;
                }

            }

        }

        function getSums($uid) {

            $sums = [];
            foreach ($this->games as $game) {
                if ($game->player->uid == $uid) {
                    $sums[$game->date][] = $game->sum;
                }
            }

            return $sums;
        }
       

    }