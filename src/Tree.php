<?php

namespace Drupal\darts;

class Tree {

    public $branches;
    public $games = [];

    function addBranch($parent, $childs) {
        if (!in_array($parent, $this->games)) {
            $this->games[] = $parent;
        }
        foreach ($childs as $child) {
            $this->branches[] = new Branch($parent, $child);

            if (!in_array($child, $this->games)) {
                $this->games[] = $child;
            }

        }

        dpm($this->games);
    }

    function getParent($gameid) {
        foreach ($this->branches as $branch) {
            if ($branch->self == $gameid) {
                return $branch->parent;
            }
        }

        return null;
    }

    function findAncestor() {

        foreach ($this->games as $game) {
            if (is_null($this->getParent($game))) {
                return $game;
            }
        }

    }

    function generateTree() {
        $this->tree[0][] = new Game($this->findAncestor());
        $this->pushBranch($this->findAncestor(), 0);

        return $this;
    }

    function pushBranch($gameid, $level) {
        foreach ($this->games as $game) {
            if ($this->getParent($game) == $gameid) {
                $this->tree[$level + 1][] = new Game($game);
                $this->tree[$level + 1][count($this->tree[$level + 1]) - 1]->addVariable('parent', $this->getParent($game));



                $this->pushBranch($game, $level + 1);
            }
        }
    }

    
}