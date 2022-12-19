<?php

namespace Drupal\darts;

class Branch {

    public $parent;
    public $self;

    function __construct($parent, $child) {
        $this->parent = $parent;
        $this->self = $child;
    }

    function getAncestor() {

    }
}