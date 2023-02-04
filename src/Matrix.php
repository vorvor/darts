<?php

namespace Drupal\darts;

class Matrix {

    public $games;
    public $finalLimit;
    public $removeCells = [];
    public $gamesRebuild;
    public $title;
    
    function __construct($games) {
        foreach ($games as $game) {
            $this->games[$game->gameid] = $game;
        }
    }

    function title($title) {
        $this->title = $title;
    }

    function removeCells($gameIds) {
        foreach ($this->gamesRebuild[count($this->gamesRebuild) - 1] as $keyy => $game) {
            foreach ($game as $key => $row) {

                if (in_array($row['gameid'], $gameIds)) {
                    unset($this->gamesRebuild[count($this->gamesRebuild) - 1][$keyy][$key]);
                }   
            }
        }

        return $this;
    }

    function setFinalLimit($gameid) {
        $this->finalLimit = $gameid;
    }

    function setPlayers($uid) {
        
        $players[$uid] = new Player($uid);

        foreach ($this->games as $game) {
            if ($game->gameid <= $this->finalLimit && array_key_exists($uid, $game->players)) {

                $removeCurrentPLayer = array_diff(array_keys($game->players), [$uid]);
                $other_player = reset($removeCurrentPLayer);
                $players[$other_player] = new Player($other_player);
            }
        }

        ksort($players);

        return $players;
    }

    function getGamesOfPlayer($uid) {

        $players = $this->setPlayers($uid);


        $games = [];
        foreach ($players as $player) {

            foreach ($this->games as $game) {
                if ($game->gameid <= $this->finalLimit && array_key_exists($player->uid, $game->players)) {
                    $wins = $this->getResultGame($game->gameid, $player->uid);

                    $removeCurrentPLayer = array_diff(array_keys($wins), [$player->uid]);
                    $other_player = reset($removeCurrentPLayer);


                    if (!in_array($game->gameid, $this->removeCells)) {

                        $games[$player->uid][$other_player] = [
                            'gameid' => $game->gameid,
                            'player' => new Player($player->uid),
                            'opponent' => new Player($other_player),
                            'result' => $wins[$player->uid] . ' - ' . $wins[$other_player],
                        ];
                    }
                }
            }

            ksort($games[$player->uid]);
        }

        $this->gamesRebuild[] = $games;

        return $this;
    }

    function getResultGame($gameid, $uid) {

        $wins = [];
        foreach ($this->games[$gameid]->players as $player) {
            $wins[$player->uid] = 0;
        }

        foreach ($this->games[$gameid]->legs as $leg) {
            $wins[$leg->winner->uid]++;
        }

        return $wins;
    }
}