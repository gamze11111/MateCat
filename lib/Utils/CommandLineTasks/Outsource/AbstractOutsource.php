<?php
/**
 * Created by PhpStorm.
 * User: fregini
 * Date: 20/12/2016
 * Time: 10:14
 */

namespace CommandLineTasks\Outsource;

use API\V2\Json\ProjectUrls;
use Features\Microsoft;
use Features\Microsoft\Utils\Email\ConfirmedQuotationEmail;
use Features\Microsoft\Utils\Email\ErrorQuotationEmail;
use Features\Outsource\Traits\Translated;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Exception\InvalidArgumentException;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;


abstract class AbstractOutsource extends Command {

    use Translated;

    protected $jobId;
    protected $jobPass;
    protected $projectId;
    protected $projectPass;

    /**
     * @var InputInterface
     */
    protected $input;

    /**
     * @var OutputInterface
     */
    protected $output;

    protected function configure() {
        $this
                // the short description shown while running "php bin/console list"
                ->setDescription( 'Place an hts order for a job from a specified user.' )
                // the full command description shown when running the command with
                // the "--help" option
                ->setHelp( "This command allows you to send a job to hts from a specified user..." )
                ->addOption( 'jid', null, InputOption::VALUE_OPTIONAL )
                ->addOption( 'jp', null, InputOption::VALUE_OPTIONAL )
                ->addOption( 'pid', null, InputOption::VALUE_OPTIONAL )
                ->addOption( 'ppass', null, InputOption::VALUE_OPTIONAL )
                ->addOption( 'all', 'a', InputOption::VALUE_NONE );

    }

    protected function execute( InputInterface $input, OutputInterface $output ) {

        $this->input  = $input;
        $this->output = $output;

        $this->jobId       = $input->getOption( 'jid' );
        $this->jobPass     = $input->getOption( 'jp' );
        $this->projectId   = $input->getOption( 'pid' );
        $this->projectPass = $input->getOption( 'ppass' );

        if ( !empty( $this->jobId ) || !empty( $this->jobPass ) ) {

            if ( empty( $this->jobId ) ) {
                throw new InvalidArgumentException( "Job ID required" );
            }

            if ( empty( $this->jobPass ) ) {
                throw new InvalidArgumentException( "Job Password required" );
            }

            $this->_callByJob();

        } elseif ( !empty( $this->projectId ) || !empty( $this->projectPass ) ) {

            if ( empty( $this->projectId ) ) {
                throw new InvalidArgumentException( "Project ID required" );
            }
            if ( empty( $this->projectPass ) ) {
                throw new InvalidArgumentException( "Project Password required" );
            }

            $this->_callByProject();

        } else {
            $this->output->writeln( "No input parameters provided." );
        }

    }

    abstract protected function _call( \Jobs_JobStruct $job, \Projects_ProjectStruct $project );

    protected function _callByJob() {

        $_job           = new \Jobs_JobStruct();
        $_job->id       = $this->jobId;
        $_job->password = $this->jobPass;

        $job = @( new \Jobs_JobDao() )->read( $_job )[ 0 ];

        if ( empty( $job ) ) {
            throw new \OutOfBoundsException( "Job not found" );
        }

        $project = $job->getProject( 0 );

        $this->_call( $job, $project );

    }

    protected function _callByProject() {

        try {
            $project = @\Projects_ProjectDao::findByIdAndPassword( $this->projectId, $this->projectPass, 0 );
        } catch ( \Exception $e ) {
            throw new \OutOfBoundsException( $e->getMessage(), $e->getCode() );
        }

        $jobs = $project->getJobs();

        $a = $this->input->getOption( 'all' );

        if ( count( $jobs ) != 1 && !$a ) {
            throw new \RangeException( "This project contains more than one job, you must call them directly or set the ALL parameter." );
        }

        $job = $jobs[ 0 ];

        $this->_call( $job, $project );

    }


}