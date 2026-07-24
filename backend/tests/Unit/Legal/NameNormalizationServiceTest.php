<?php

namespace Tests\Unit\Legal;

use App\Services\Legal\NameNormalizationService;
use Tests\TestCase;

class NameNormalizationServiceTest extends TestCase
{
    protected NameNormalizationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new NameNormalizationService();
    }

    public function test_arabic_diacritics_are_removed()
    {
        $input = "شَرِكَةُ التَّقْنِيَةِ";
        $expected = "شركه التقنيه"; // Testing Ta Marbuta normalization as well
        
        $this->assertEquals($expected, $this->service->normalize($input));
    }

    public function test_alef_and_hamza_are_normalized()
    {
        $input = "أحمد إبراهيم آمال";
        $expected = "احمد ابراهيم امال";
        
        $this->assertEquals($expected, $this->service->normalize($input));
    }

    public function test_english_corporate_suffixes_are_stripped()
    {
        $input = "Global Tech LLC";
        $expected = "global tech";
        
        $this->assertEquals($expected, $this->service->normalize($input));
    }
}
